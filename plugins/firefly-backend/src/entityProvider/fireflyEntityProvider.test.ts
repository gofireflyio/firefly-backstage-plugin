import { mockServices } from '@backstage/backend-test-utils';
import { FireflyEntityProvider } from './fireflyEntityProvider';
import { ConfigReader } from '@backstage/config';
import { FireflyClient } from '../client/fireflyClient';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { FireflyAsset } from '../client/types';
import { BackstageCredentials, BackstageServicePrincipal } from '@backstage/backend-plugin-api';
import { GetEntitiesResponse } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

// Mock FireflyClient
const mockFireflyClient = {
  login: jest.fn(),
  getAssets: jest.fn(),
  getAllAssets: jest.fn(),
  baseUrl: 'https://api.firefly.ai/api/v1.0' as const,
  accessKey: 'test',
  secretKey: 'test',
  accessToken: 'test',
  logger: mockServices.logger.mock(),
  request: jest.fn(),
} as unknown as jest.Mocked<FireflyClient>;

// Mock AuthService
const mockAuthService = mockServices.auth.mock();

// Mock EntityProviderConnection
const mockConnection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as jest.Mocked<EntityProviderConnection>;

const mockAsset: FireflyAsset = {
  vcsRepo: 'test-repo',
  resourceCreationDate: Date.now(),
  lastResourceStateChange: Date.now(),
  assetId: 'test-asset-id',
  assetType: 'aws_s3_bucket',
  name: 'test-asset',
  vcsProvider: 'github',
  providerId: 'test-provider',
  iacType: 'terraform',
  state: 'managed',
  resourceId: 'test-resource-id',
  arn: 'arn:aws:s3:::test-bucket',
  terraformModule: 'test-module',
  terraformObjectName: 'test_bucket',
  deleteCommand: 'terraform destroy',
  stateLocationString: 'test/state/location',
  owner: 'test-owner',
  tfObject: {},
  vcsCodeLink: 'https://github.com/test/repo',
  consoleURL: 'https://console.aws.amazon.com',
  fireflyLink: 'https://app.firefly.ai/asset/test',
  tagsList: ['test-tag'],
  region: 'us-east-1',
  fireflyAssetId: 'test-firefly-id',
  connectionSources: [],
  connectionTargets: [],
};

const config = new ConfigReader({
  firefly: {
    periodicCheck: {
      interval: 1800,
      importSystems: true,
      importResources: true,
      correlateByComponentName: true,
      tagKeysIdentifiers: ['app', 'env'],
      filters: {
        assetTypes: ['aws_s3_bucket', 'aws_lambda_function', 'google_compute_subnetwork'],
        providerIds: ['094724549126', 'devops-372014'],
      },
    },
  },
});

describe('FireflyEntityProvider', () => {
  const mockLogger = mockServices.logger.mock();
  const mockAuth = mockServices.auth.mock();
  const mockCatalog = {
    getEntities: jest.fn(),
  } as unknown as jest.Mocked<CatalogService>;

  let provider: FireflyEntityProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFireflyClient.getAllAssets.mockReset();
    mockCatalog.getEntities.mockReset();
    mockAuthService.getOwnServiceCredentials.mockReset();
    mockConnection.applyMutation.mockReset();

    provider = new FireflyEntityProvider({
      fireflyClient: mockFireflyClient,
      catalogService: mockCatalog,
      logger: mockLogger,
      config: config,
      auth: mockAuth,
    });
  });

  // Test provider initialization
  describe('initialization', () => {
    it('should initialize with default values when no config is provided', () => {
      const defaultProvider = new FireflyEntityProvider({
        fireflyClient: mockFireflyClient,
        catalogService: mockCatalog,
        logger: mockLogger,
        config: new ConfigReader({}),
        auth: mockAuth,
      });

      expect(defaultProvider.getProviderName()).toBe('firefly');
    });

    it('should initialize with custom config values', () => {
      expect(provider.getProviderName()).toBe('firefly');
    });
  });

  // Test name validation
  describe('validName', () => {
    it('should sanitize invalid characters', () => {
      const testCases = [
        { input: 'test@name', expected: 'test_name' },
        { input: 'test.name', expected: 'test.name' },
        { input: 'test-name', expected: 'test-name' },
        { input: 'test_name', expected: 'test_name' },
        { input: 'test$name%123', expected: 'test_name_123' },
        { input: '_test_name_', expected: 'test_name' },
        { input: '...test...name...', expected: 'test_name' },
        { input: 'a'.repeat(100), expected: 'a'.repeat(63) },
      ];

      testCases.forEach(({ input, expected }) => {
        // @ts-ignore - accessing private method for testing
        expect(provider.validName(input)).toBe(expected);
      });
    });
  });

  // Test label processing
  describe('getLabels', () => {
    it('should process tags into valid labels', () => {
      const testCases = [
        {
          input: ['key: value'],
          expected: { key: 'value' },
        },
        {
          input: ['invalid-format'],
          expected: { 'invalid-format': '' },
        },
        {
          input: ['key1: value1', 'key2: value2'],
          expected: { key1: 'value1', key2: 'value2' },
        },
        {
          input: ['key@1: value#1', 'key.2: value.2'],
          expected: { key_1: 'value_1', 'key.2': 'value.2' },
        },
        {
          input: ['Key: value', 'key: value2'],
          expected: { key: 'value2' },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // @ts-ignore - accessing private method for testing
        expect(provider.getLabels(input)).toEqual(expected);
      });
    });
  });

  // Test system entity creation
  describe('getSystems', () => {
    it('should create system entities from assets', () => {
      const testAssets = [
        { ...mockAsset, providerId: 'aws-123', assetType: 'aws_s3_bucket' },
        { ...mockAsset, providerId: 'aws-123', assetType: 'aws_lambda_function' },
        { ...mockAsset, providerId: 'gcp-456', assetType: 'google_compute_instance' },
      ];

      // @ts-ignore - accessing private method for testing
      const systems = provider.getSystems(testAssets);

      expect(systems).toHaveLength(2); // Should create 2 unique systems
      expect(systems[0]?.metadata?.name).toBe('aws-123');
      expect(systems[0]?.spec?.type).toBe('aws');
      expect(systems[1]?.metadata?.name).toBe('gcp-456');
      expect(systems[1]?.spec?.type).toBe('google');
    });
  });

  // Test asset to entity conversion
  describe('assetToEntity', () => {
    it('should convert asset to entity with all required fields', async () => {
      const testAsset = {
        ...mockAsset,
        tagsList: ['env: prod', 'app: test'],
      };

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockResolvedValue({ items: [] });

      // @ts-ignore - accessing private method for testing
      const entity = await provider.assetToEntity(testAsset, []);

      expect(entity.apiVersion).toBe('backstage.io/v1alpha1');
      expect(entity.kind).toBe('Resource');
      expect(entity.metadata.labels).toEqual({
        env: 'prod',
        app: 'test',
        location: 'us-east-1',
      });
      expect(entity.spec?.type).toBe('aws_s3_bucket');
      expect(entity.spec?.owner).toBe('test-owner');
      expect(entity.metadata.annotations?.['firefly.ai/asset-id']).toBe('test-asset-id');
    });

    it('should handle assets with connection dependencies', async () => {
      const testAsset = {
        ...mockAsset,
        connectionSources: ['source1', 'source2'],
        connectionTargets: ['target1'],
      };

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockResolvedValue({ items: [] });

      // @ts-ignore - accessing private method for testing
      const entity = await provider.assetToEntity(testAsset, []);

      expect(entity.spec?.dependsOn).toHaveLength(2);
      expect(entity.spec?.dependencyOf).toHaveLength(1);
    });
  });

  // Test refresh functionality
  describe('refresh', () => {
    it('should handle empty assets list', async () => {
      mockFireflyClient.getAllAssets.mockResolvedValue([]);

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockFireflyClient.getAllAssets).toHaveBeenCalled();
      expect(mockConnection.applyMutation).not.toHaveBeenCalled();
    });

    it('should process assets and create entities', async () => {
      mockFireflyClient.getAllAssets.mockResolvedValue([mockAsset]);
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockResolvedValue({ items: [] });

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockConnection.applyMutation).toHaveBeenCalled();
      const mutation = mockConnection.applyMutation.mock.calls[0][0] as any;
      expect(mutation.type).toBe('full');
      expect(mutation.entities).toHaveLength(2); // 1 resource + 1 system
    });
  });

  // Test error handling
  describe('error handling', () => {
    it('should handle errors when fetching assets', async () => {
      mockFireflyClient.getAllAssets.mockRejectedValue(new Error('API Error'));

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockConnection.applyMutation).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to refresh Firefly assets',
        expect.any(Object),
      );
    });

    it('should handle errors when fetching components', async () => {
      const testAsset = {
        ...mockAsset,
        tagsList: ['app: test', 'env: prod'], // Add tags to trigger component correlation
      };

      mockFireflyClient.getAllAssets.mockResolvedValue([testAsset]);
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockRejectedValue(new Error('Catalog Error'));

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockConnection.applyMutation).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch components: Error: Catalog Error',
      );
    });
  });

  // Test component correlation
  describe('component correlation', () => {
    it('should correlate resources with components by tags', async () => {
      const testAsset = {
        ...mockAsset,
        tagsList: ['app: test', 'env: prod'],
      };

      const mockEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
          labels: {
            'app': 'test',
            'env': 'prod',
          },
        },
        spec: {},
      };
      const mockComponents: GetEntitiesResponse = {
        items: [mockEntity],
      };

      mockFireflyClient.getAllAssets.mockResolvedValue([testAsset]);
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockResolvedValue(mockComponents);

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockConnection.applyMutation).toHaveBeenCalled();
      const mutation = mockConnection.applyMutation.mock.calls[0][0] as any;
      expect(mutation.entities[0].entity.spec.dependencyOf).toContain(
        'component:default/test-component',
      );
    });

    it('should correlate resources with components by name', async () => {
      const testAsset = {
        ...mockAsset,
        tagsList: ['app: test-component'],
      };

      const mockEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
        },
        spec: {},
      };

      const mockComponents: GetEntitiesResponse = {
        items: [mockEntity],
      };

      mockFireflyClient.getAllAssets.mockResolvedValue([testAsset]);
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: 'token',
      } as unknown as BackstageCredentials<BackstageServicePrincipal>);
      mockCatalog.getEntities.mockResolvedValue(mockComponents);

      await provider.connect(mockConnection);
      await provider.refresh();

      expect(mockConnection.applyMutation).toHaveBeenCalled();
      const mutation = mockConnection.applyMutation.mock.calls[0][0] as any;
      expect(mutation.entities[0].entity.spec.dependencyOf).toContain(
        'component:default/test-component',
      );
    });
  });
}); 