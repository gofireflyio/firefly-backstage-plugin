import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { FireflyClient, FireflyFilters } from './fireflyClient';
import { Entity } from '@backstage/catalog-model';

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
  private readonly filters: FireflyFilters;
  private readonly intervalMs: number;

  constructor(options: FireflyEntityProviderOptions) {
    this.logger = options.logger;
    this.fireflyClient = options.fireflyClient;
    this.config = options.config;
    
    // Get configuration for periodic checks
    const periodicCheckConfig = this.config.getOptionalConfig('firefly.periodicCheck');
    this.filters = periodicCheckConfig?.getOptional<FireflyFilters>('filters') || {};
    this.intervalMs = (periodicCheckConfig?.getOptionalNumber('interval') || 3600) * 1000;
  }

  /** @inheritdoc */
  getProviderName(): string {
    return 'firefly';
  }

  /** @inheritdoc */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.refresh();
    
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
      const assets = await this.fireflyClient.getAssets(this.filters);

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
    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        name: asset.identifier,
        annotations: {
          'firefly.ai/asset-id': asset.identifier,
          'firefly.ai/cloud-link': asset.cloudLink,
          'firefly.ai/code-link': asset.codeLink,
          'firefly.ai/firefly-link': asset.fireflyLink,
        },
      },
      spec: {
        type: 'firefly-asset',
        owner: 'firefly-plugin',
        system: 'firefly',
        lifecycle: 'production',
        dependsOn: [],
        tags: asset.tags,
      },
    };
  }
} 