import axios from 'axios';

export interface FireflyClientConfig {
  accessKey: string;
  secretKey: string;
}

export interface FireflyAsset {
  identifier: string;
  name: string;
  cloudAccountIdentifier: string;
  iacStatus: string;
  cloudLink: string;
  codeLink: string;
  fireflyLink: string;
  tags: Record<string, string>;
}

export interface FireflyAggregation {
  type: string;
  count: number;
  details: Record<string, any>;
}

export interface FireflyFilters {
  tags?: Record<string, string>;
  assetTypes?: string[];
  cloudAccounts?: string[];
}

export class FireflyClient {
  private readonly baseUrl = 'https://api.firefly.ai/v1';
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor(config: FireflyClientConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
  }

  private async request<T>(path: string, params?: Record<string, any>): Promise<T> {
    const response = await axios.get(`${this.baseUrl}${path}`, {
      params,
      headers: {
        'Authorization': `Bearer ${this.accessKey}`,
        'X-Secret-Key': this.secretKey,
      },
    });
    return response.data;
  }

  async getAssets(filters?: FireflyFilters): Promise<FireflyAsset[]> {
    const params: Record<string, any> = {};
    
    if (filters?.tags) {
      params.tags = JSON.stringify(filters.tags);
    }
    if (filters?.assetTypes) {
      params.assetTypes = filters.assetTypes.join(',');
    }
    if (filters?.cloudAccounts) {
      params.cloudAccounts = filters.cloudAccounts.join(',');
    }

    return this.request<FireflyAsset[]>('/inventory/assets', params);
  }

  async getAggregations(filters?: FireflyFilters): Promise<FireflyAggregation[]> {
    const params: Record<string, any> = {};
    
    if (filters?.tags) {
      params.tags = JSON.stringify(filters.tags);
    }
    if (filters?.assetTypes) {
      params.assetTypes = filters.assetTypes.join(',');
    }
    if (filters?.cloudAccounts) {
      params.cloudAccounts = filters.cloudAccounts.join(',');
    }

    return this.request<FireflyAggregation[]>('/inventory/aggregations', params);
  }
} 