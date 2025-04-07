import { mockServices } from '@backstage/backend-test-utils';
import axios from 'axios';
import { FireflyClient } from './fireflyClient';
import { FireflyInventoryResponse, FireflyAsset } from './types';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('FireflyClient', () => {
  // Test configuration
  const config = {
    accessKey: 'test-access-key',
    secretKey: 'test-secret-key',
    logger: mockServices.logger.mock(),
  };

  // Test data
  const mockAccessToken = 'test-access-token';
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

  const mockInventoryResponse: FireflyInventoryResponse = {
    responseObjects: [mockAsset],
    totalObjects: 1,
    afterKey: 'next-page',
  };

  let client: FireflyClient;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    client = new FireflyClient(config);
  });

  describe('login', () => {
    it('should successfully login and get access token', async () => {
      // Mock successful login response
      mockedAxios.post.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

      const token = await client.login();

      expect(token).toBe(mockAccessToken);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.firefly.ai/api/v1.0/login',
        {
          accessKey: config.accessKey,
          secretKey: config.secretKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw error when login fails', async () => {
      // Mock failed login response
      const axiosError = new axios.AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any }
      );
      // Set the response property to make axios.isAxiosError check work correctly
      axiosError.response = { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any };
      mockedAxios.post.mockRejectedValueOnce(axiosError);
      
      // Ensure axios.isAxiosError returns true for our error
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true);

      await expect(client.login()).rejects.toThrow('Login failed: 401 - undefined');
    });

    it('should throw error when no access token is received', async () => {
      // Mock response without access token
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await expect(client.login()).rejects.toThrow('No access token received from login');
    });
  });

  describe('getAssets', () => {
    it('should successfully retrieve assets', async () => {
      // Mock login and inventory response
      mockedAxios.post.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });
      mockedAxios.mockResolvedValueOnce({ data: mockInventoryResponse });

      const filters = { assetTypes: ['aws_s3_bucket'] };
      const response = await client.getAssets(filters);

      expect(response).toEqual(mockInventoryResponse);
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.firefly.ai/api/v1.0/inventory',
        data: filters,
        headers: {
          'Authorization': `Bearer ${mockAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('getAllAssets', () => {
    it('should retrieve all assets with pagination', async () => {
      // Mock login response
      mockedAxios.post.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

      // Mock paginated responses
      const page1Response = {
        ...mockInventoryResponse,
        responseObjects: [mockAsset, {
          ...mockAsset,
          assetId: 'test-asset-id-2',
        }],
      };
      const page2Response = {
        ...mockInventoryResponse,
        responseObjects: [{
          ...mockAsset,
          assetId: 'test-asset-id-3',
        }],
        afterKey: undefined,
      };

      mockedAxios
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response });

      const assets = await client.getAllAssets(undefined, 2);

      expect(assets).toHaveLength(3);
      expect(assets[0].assetId).toBe('test-asset-id');
      expect(assets[1].assetId).toBe('test-asset-id-2');
      expect(assets[2].assetId).toBe('test-asset-id-3');
    });

    it('should handle errors with retries', async () => {
      // Mock login response
      mockedAxios.post.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

      // Mock failed request followed by successful request
      mockedAxios
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockInventoryResponse });

      const assets = await client.getAllAssets();

      expect(assets).toHaveLength(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // 1 login (successful)
      expect(mockedAxios).toHaveBeenCalledTimes(2); // 2 inventory calls (1 failed, 1 successful)
    });

    it('should throw error after max retries', async () => {
      // Mock login response
      mockedAxios.post.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

      // Mock three failed requests
      mockedAxios
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getAllAssets()).rejects.toThrow('Network error');
    });
  });
}); 