import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { FireflyClient } from './client/fireflyClient';
import { Entity } from '@backstage/catalog-model';
import crypto from 'crypto';
import { FireflyAssetFilters } from './client/types';

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
 * This provider imports both systems (cloud accounts) and resources (cloud assets)
 * based on configuration options.
 */
export class FireflyEntityProvider implements EntityProvider {
  private readonly logger: LoggerService;
  private readonly fireflyClient: FireflyClient;
  private readonly config: Config;
  private connection?: EntityProviderConnection;
  private readonly filters: FireflyAssetFilters;
  private readonly intervalMs: number;
  private readonly importSystems: boolean;
  private readonly importResources: boolean;

  /**
   * Creates a new instance of the FireflyEntityProvider
   * @param options - Configuration options for the provider
   */
  constructor(options: FireflyEntityProviderOptions) {
    this.logger = options.logger;
    this.fireflyClient = options.fireflyClient;
    this.config = options.config;
    
    // Get configuration for periodic checks
    const periodicCheckConfig = this.config.getOptionalConfig('firefly.periodicCheck');
    this.filters = periodicCheckConfig?.getOptional<FireflyAssetFilters>('filters') || {};
    this.intervalMs = (periodicCheckConfig?.getOptionalNumber('interval') || 3600) * 1000;
    this.importSystems = periodicCheckConfig?.getOptionalBoolean('importSystems') || false;
    this.importResources = periodicCheckConfig?.getOptionalBoolean('importResources') || false;
  }

  /** 
   * Returns the name of this provider
   * @inheritdoc 
   */
  getProviderName(): string {
    return 'firefly';
  }

  /** 
   * Establishes a connection with the entity provider and starts the refresh cycle
   * @param connection - The connection to the entity catalog
   * @inheritdoc 
   */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    this.refresh();
    
    // Set up recurring refresh if an interval is configured
    if (this.intervalMs > 0) {
      setInterval(() => this.refresh(), this.intervalMs);
    }
  }

  /**
   * Reads all assets from Firefly and converts them into catalog entities
   * This method is called periodically to keep the catalog in sync with Firefly
   */
  private async refresh(): Promise<void> {
    if (!this.connection) {
      throw new Error('Firefly entity provider is not initialized');
    }

    try {
      this.logger.info('Refreshing Firefly assets');
      const assets = await this.fireflyClient.getAllAssets(this.filters);
      this.logger.info(`Found ${assets.length} assets`);

      // Convert assets to catalog entities based on configuration
      const resources = this.importResources ? assets.map(asset => this.assetToEntity(asset)) : [];
      const systems = this.importSystems ? this.getSystems(assets) : [];

      if (this.importResources) {
        this.logger.info(`Found ${resources.length} resources`);
      }

      if (this.importSystems) {
        this.logger.info(`Found ${systems.length} systems`);
      }

      const entities = [...resources, ...systems];
      if (entities.length === 0) {
        this.logger.info('No entities found');
        return;
      }

      // Emit all entities to the catalog
      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: 'firefly',
        })),
      });

      this.logger.info(`Firefly refresh completed, ${entities.length} entities found`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to refresh Firefly assets', { error: errorMessage });
    }
  }

  /**
   * Creates system entities from the collected assets
   * Each cloud provider account/project becomes a system entity
   * 
   * @param assets - The assets fetched from Firefly
   * @returns An array of system entities
   */
  private getSystems(assets: any[]): Entity[] {
     // Create a map of provider IDs to provider information
     let originProviders: Record<string, any> = {};
     assets.forEach(asset => {
      originProviders[asset.providerId] = {
        name: asset.providerId,
        owner: 'Firefly',
        type: asset.assetType.split('_')[0], // Extract provider type (aws, gcp, azure)
      }
     });

     // Convert each provider to a System entity
     return Object.values(originProviders).map((provider) => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: { 
        name: provider.name,
        annotations: {
          'backstage.io/managed-by-location': `url:https://app.firefly.ai/`, 
          'backstage.io/managed-by-origin-location': `url:https://app.firefly.ai/`,

          'firefly.ai/origin-provider-id': provider.name,
        },  
      },
      spec: {
        owner: 'firefly',
        type: provider.type,
      },
     }));
  }

  /**
   * Sanitizes a name to make it valid for Kubernetes labels/annotations
   * 
   * @param name - The string to sanitize
   * @returns A sanitized string that conforms to Kubernetes label constraints
   */
  private validName(name: string): string {
     // Replace invalid characters with underscore and limit to 63 chars
     name = name.replace(/[^a-zA-Z0-9\-_.]/g, '_').substring(0, 63);
     // Remove consecutive separators and trim leading/trailing separators
     name = name.replace(/[-_.]{2,}/g, '_').replace(/^[-_.]|[-_.]$/g, '');
     return name;
  }

  /**
   * Converts Firefly tags to Kubernetes-compatible labels
   * 
   * @param tagsList - List of tags from Firefly
   * @returns A record of key-value pairs conforming to Kubernetes label format
   */
  private getLabels(tagsList: string[]): Record<string, string> {
    return tagsList.reduce((acc: Record<string, string>, tag: string) => {
      // Parse tag into key-value pairs, ensuring they follow Kubernetes label format
      // Keys and values must be alphanumeric with [-_.] separators and max 63 chars
      const parts = tag.split(': ');
      let key = parts[0] || '';
      let value = parts[1] || '';
      
      // Sanitize key and value to match Kubernetes label format
      // First replace invalid characters with underscores
      key = this.validName(key);
      value = this.validName(value);
      acc[key] = value;
      return acc;
    }, {})
  }

  /**
   * Converts a Firefly asset to a Backstage entity
   * Maps asset metadata to entity annotations and establishes relationships
   * 
   * @param asset - The Firefly asset to convert
   * @returns A Backstage entity representing the asset
   */
  private assetToEntity(asset: any): Entity {
    // Create a consistent, unique ID for the asset based on its Firefly ID
    const assetIdHash = crypto.createHash('sha1').update(asset.fireflyAssetId).digest('hex');
    
    // Map connection sources and targets to entity references for dependsOn/dependencyOf
    const connectionSourcesIds = asset.connectionSources.map((source: string) => 
      `resource:${crypto.createHash('sha1').update(source).digest('hex')}`
    );
    const connectionTargetsIds = asset.connectionTargets.map((target: string) => 
      `resource:${crypto.createHash('sha1').update(target).digest('hex')}`
    );
    
    // Process tags for Kubernetes-compatible labels
    let labels = this.getLabels(asset.tagsList);
    labels['location'] = asset.region || 'unknown';
    
    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        labels,
        tags: Object.values(labels).map(value => 
          value.toLowerCase().replace(/[^a-z0-9+#\-]/g, '-').substring(0, 63)
        ).filter(tag => tag.length >= 1),
        name: assetIdHash,
        title: asset.name,
        description: JSON.stringify(asset.tfObject),
        annotations: {
          'backstage.io/managed-by-location': `url:${asset.fireflyLink}`, 
          'backstage.io/managed-by-origin-location': `url:${asset.fireflyLink}`,
          
          // Asset identification annotations
          'firefly.ai/asset-id': asset.assetId,
          'firefly.ai/resource-id': asset.resourceId,
          'firefly.ai/fireflyAssetId': asset.fireflyAssetId,
          
          // Resource metadata annotations
          'firefly.ai/name': asset.name,
          'firefly.ai/arn': asset.arn,
          'firefly.ai/state': asset.state,
          'firefly.ai/location': asset.region,
          'firefly.ai/owner': asset.owner,
          
          // Links to external resources
          'firefly.ai/cloud-link': asset.consoleURL,
          'firefly.ai/code-link': asset.vcsCodeLink,
          'firefly.ai/firefly-link': asset.fireflyLink,
          
          // Infrastructure as code information
          'firefly.ai/iac-type': asset.iacType,
          'firefly.ai/terraform-module': asset.terraformModule,
          'firefly.ai/terraform-object-name': asset.terraformObjectName,
          'firefly.ai/delete-command': asset.deleteCommand,
          'firefly.ai/state-location': asset.stateLocationString,
          
          // Provider information
          'firefly.ai/origin-provider-id': asset.providerId,
          'firefly.ai/vcs-provider': asset.vcsProvider,
          'firefly.ai/vcs-repo': asset.vcsRepo,
          
          // Timestamps
          'firefly.ai/resource-creation-date': String(asset.resourceCreationDate),
          'firefly.ai/last-resource-state-change': String(asset.lastResourceStateChange),
          
          // Configuration data
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