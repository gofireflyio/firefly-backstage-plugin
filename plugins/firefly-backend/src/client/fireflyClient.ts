import { LoggerService } from '@backstage/backend-plugin-api/index';
import axios from 'axios';
import { FireflyAsset, FireflyInventoryResponse, FireflyAssetFilters, FireflyAggregation } from './types';

export interface FireflyClientConfig {
  accessKey: string;
  secretKey: string;
  logger: LoggerService;
}

export class FireflyClient {
  private readonly baseUrl = 'https://api.firefly.ai/api/v1.0';
  private readonly accessKey: string;
  private readonly secretKey: string;
  private accessToken: string = '';
  private readonly logger: LoggerService;

  constructor(config: FireflyClientConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.logger = config.logger;
  }

  /**
   * Authenticates with the Firefly API and obtains an access token
   */
  async login(): Promise<string> {
    try {
      console.log(`${this.baseUrl}/login`);
      const response = await axios.post(`${this.baseUrl}/login`, {
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.accessToken) {
        throw new Error('No access token received from login');
      }

      this.accessToken = response.data.accessToken;
      return this.accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Login failed: ${error.response?.status} - ${error}`);
      }
      throw error;
    }
  }

  /**
   * Makes an authenticated request to the Firefly API
   */
  private async request<T>(path: string, method: 'GET' | 'POST' = 'GET', data?: Record<string, any>): Promise<T> {
    if (!this.accessToken) {
      await this.login();
    }

    if (!this.accessToken) {
      throw new Error('Failed to obtain access token');
    }

    const response = await axios({
      method,
      url: `${this.baseUrl}${path}`,
      data,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Retrieves a list of assets based on the provided filters
   */
  async getAssets(filters?: FireflyAssetFilters): Promise<FireflyInventoryResponse> {
    const response = await this.request<FireflyInventoryResponse>('/inventory', 'POST', filters);
    return response;
  }

  /**
   * Retrieves a list of all assets based on the provided filters
   */
  async getAllAssets(filters?: FireflyAssetFilters): Promise<FireflyAsset[]> {
    this.logger.info('Getting all assets');
    const assets: FireflyAsset[] = [];
    let hasMore = true;
    let page = 1;
    const pageSize = 10000;
    let afterKey: string | undefined;
    while (hasMore) {
      // Try up to 3 times to get assets
      let retries = 0;
      let response;
      while (retries < 3) {
        try {
          response = await this.getAssets({ ...filters, size: pageSize, afterKey });
          break;
        } catch (error) {
          retries++;
          if (retries === 3) {
            throw error;
          }
          this.logger.warn(`Failed to get assets, attempt ${retries} of 3`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }

      if (!response) {
        throw new Error('Failed to get assets');
      }

      this.logger.info(`Found ${response.responseObjects.length} assets on page ${page}, total objects: ${response.totalObjects}`);
      assets.push(...response.responseObjects);
      hasMore = response.responseObjects.length === pageSize;
      afterKey = response.afterKey;
      page++;
    }

    return assets;
  }

  /**
   * Retrieves aggregations based on the provided filters
   */
  async getAggregations(filters?: FireflyAssetFilters): Promise<FireflyAggregation[]> {
    return this.request<FireflyAggregation[]>('/inventory/aggregations', 'POST', filters);
  }
} 