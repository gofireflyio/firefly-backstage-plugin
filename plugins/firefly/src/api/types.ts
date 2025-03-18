/**
 * Represents a Firefly asset with its properties and links
 */
export interface FireflyAsset {
  /** Unique identifier for the asset */
  identifier: string;
  /** Display name of the asset */
  name: string;
  /** Identifier of the associated cloud account */
  cloudAccountIdentifier: string;
  /** Current status of the infrastructure as code */
  iacStatus: string;
  /** Link to the asset in the cloud provider's console */
  cloudLink: string;
  /** Link to the asset's code repository */
  codeLink: string;
  /** Link to the asset in Firefly's dashboard */
  fireflyLink: string;
  /** Key-value pairs of tags associated with the asset */
  tags: Record<string, string>;
}

/**
 * Represents aggregated data from Firefly
 */
export interface FireflyAggregation {
  /** Type of aggregation (e.g., 'by_region', 'by_type') */
  type: string;
  /** Count of items in this aggregation */
  count: number;
  /** Detailed breakdown of the aggregation */
  details: Record<string, any>;
}

/**
 * Filter options for Firefly API queries
 */
export interface FireflyFilters {
  /** Filter by tags */
  tags?: Record<string, string>;
  /** Filter by asset types */
  assetTypes?: string[];
  /** Filter by cloud accounts */
  cloudAccounts?: string[];
} 