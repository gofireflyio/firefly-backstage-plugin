import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { FireflyClient, FireflyAssetFilters, FireflyAsset } from './fireflyClient';
import { Entity } from '@backstage/catalog-model';
import crypto from 'crypto';

/**
 * Options for instantiating FireflyEntityProvider
 */
export interface FireflyEntityProviderOptions {
  fireflyClient: FireflyClient;
  logger: LoggerService;
  config: Config;
}

/**
 * Provides entities from Firefly to the Backstage catalog
 */
export class FireflyEntityProvider implements EntityProvider {
  private readonly logger: LoggerService;
  private readonly fireflyClient: FireflyClient;
  private readonly config: Config;
  private connection?: EntityProviderConnection;
  private readonly filters: FireflyAssetFilters;
  private readonly intervalMs: number;

  constructor(options: FireflyEntityProviderOptions) {
    this.logger = options.logger;
    this.fireflyClient = options.fireflyClient;
    this.config = options.config;
    
    // Get configuration for periodic checks
    const periodicCheckConfig = this.config.getOptionalConfig('firefly.periodicCheck');
    this.filters = periodicCheckConfig?.getOptional<FireflyAssetFilters>('filters') || {};
    this.intervalMs = (periodicCheckConfig?.getOptionalNumber('interval') || 3600) * 1000;
  }

  /** @inheritdoc */
  getProviderName(): string {
    return 'firefly';
  }

  /** @inheritdoc */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    this.refresh();
    
    if (this.intervalMs > 0) {
      setInterval(() => this.refresh(), this.intervalMs);
    }
  }

  /**
   * Reads all assets from Firefly and converts them into catalog entities
   */
  private async refresh(): Promise<void> {
    if (!this.connection) {
      throw new Error('Firefly entity provider is not initialized');
    }

    try {
      this.logger.info('Refreshing Firefly assets');
      const assets = await this.fireflyClient.getAllAssets(this.filters);
      this.logger.info(`Found ${assets.length} assets`);

      // Convert assets to catalog entities
      const entities = assets.map(asset => this.assetToEntity(asset));

      // Emit all entities to the catalog
      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: 'firefly',
        })),
      });

      this.logger.info(`Firefly refresh completed, ${entities.length} assets found`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to refresh Firefly assets', { error: errorMessage });
    }
  }

  /**
   * Converts a Firefly asset to a Backstage entity
   */
  private assetToEntity(asset: any): Entity {
    const assetIdHash = crypto.createHash('sha1').update(asset.fireflyAssetId).digest('hex');
    const connectionSourcesIds = asset.connectionSources.map((source: string) => `resource:${crypto.createHash('sha1').update(source).digest('hex')}`);
    const connectionTargetsIds = asset.connectionTargets.map((target: string) => `resource:${crypto.createHash('sha1').update(target).digest('hex')}`);
    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        labels: asset.tagsList.reduce((acc: Record<string, string>, tag: string) => {
          // Parse tag into key-value pairs, ensuring they follow Kubernetes label format
          // Keys and values must be alphanumeric with [-_.] separators and max 63 chars
          const parts = tag.split(': ');
          let key = parts[0] || '';
          let value = parts[1] || '';
          
          // Sanitize key and value to match [a-zA-Z0-9][-_.] format
          key = key.replace(/[^a-zA-Z0-9\-_.]/g, '_').substring(0, 63);
          value = value.replace(/[^a-zA-Z0-9\-_.]/g, '_').substring(0, 63);
          acc[key] = value;
          return acc;
        }, {}),
        name: assetIdHash,
        title: asset.name,
        namespace: asset.region || 'default',
        annotations: {
          'backstage.io/managed-by-location': `url:${asset.fireflyLink}`, 
          'backstage.io/managed-by-origin-location': `url:${asset.fireflyLink}`,
          'firefly.ai/asset-id': asset.assetId,
          'firefly.ai/cloud-link': asset.consoleURL,
          'firefly.ai/code-link': asset.vcsCodeLink,
          'firefly.ai/firefly-link': asset.fireflyLink,
          'firefly.ai/iac-status': asset.iacStatus,
          'firefly.ai/iac-type': asset.iacType,
          'firefly.ai/provider-id': asset.providerId,
          'firefly.ai/provider-type': asset.providerType,
          'firefly.ai/resource-creation-date': String(asset.resourceCreationDate),
          'firefly.ai/resource-id': asset.resourceId,   
          'firefly.ai/asset-config': JSON.stringify(asset.tfObject),
        },
        links: [
          ...(asset.consoleURL ? [{
            url: asset.consoleURL,
            title: 'Cloud Link',
          }] : []),
          ...(asset.vcsCodeLink ? [{
            url: asset.vcsCodeLink,
            title: 'Code Link',
          }] : []),
          ...(asset.fireflyLink ? [{
            url: asset.fireflyLink,
            title: 'Firefly Link',
          }] : []),
        ],
      },
      spec: {
        type: asset.assetType || 'unknown',
        owner: asset.owner || 'unknown',
        system: asset.providerId || 'unknown',
        lifecycle: asset.state || 'unknown',
        dependsOn: connectionSourcesIds || [],
        dependencyOf: connectionTargetsIds || [],
      },
    };
  }
} 