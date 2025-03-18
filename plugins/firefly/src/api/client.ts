import { createApiRef } from '@backstage/core-plugin-api';
import { FireflyAsset, FireflyAggregation, FireflyFilters } from './types';

/**
 * API interface for interacting with Firefly services
 */
export interface FireflyApi {
  /**
   * Retrieves a list of Firefly assets based on optional filters
   * @param filters - Optional filters to apply to the query
   * @returns Promise resolving to an array of Firefly assets
   */
  getAssets(filters?: FireflyFilters): Promise<FireflyAsset[]>;
  
  /**
   * Retrieves aggregated data from Firefly based on optional filters
   * @param filters - Optional filters to apply to the query
   * @returns Promise resolving to an array of Firefly aggregations
   */
  getAggregations(filters?: FireflyFilters): Promise<FireflyAggregation[]>;
}

/**
 * API reference for the Firefly service
 */
export const fireflyApiRef = createApiRef<FireflyApi>({
  id: 'plugin.firefly.service',
});

/**
 * Client implementation for interacting with Firefly services
 */
export class FireflyClient implements FireflyApi {
  private readonly baseUrl = '/api/firefly';

  async getAssets(filters?: FireflyFilters): Promise<FireflyAsset[]> {
    const params = new URLSearchParams();
    if (filters?.tags) {
      params.append('tags', JSON.stringify(filters.tags));
    }
    if (filters?.assetTypes) {
      params.append('assetTypes', JSON.stringify(filters.assetTypes));
    }
    if (filters?.cloudAccounts) {
      params.append('cloudAccounts', JSON.stringify(filters.cloudAccounts));
    }

    const response = await fetch(`${this.baseUrl}/assets?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Firefly assets');
    }
    return response.json();
  }

  async getAggregations(filters?: FireflyFilters): Promise<FireflyAggregation[]> {
    const params = new URLSearchParams();
    if (filters?.tags) {
      params.append('tags', JSON.stringify(filters.tags));
    }
    if (filters?.assetTypes) {
      params.append('assetTypes', JSON.stringify(filters.assetTypes));
    }
    if (filters?.cloudAccounts) {
      params.append('cloudAccounts', JSON.stringify(filters.cloudAccounts));
    }

    const response = await fetch(`${this.baseUrl}/aggregations?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Firefly aggregations');
    }
    return response.json();
  }
} 