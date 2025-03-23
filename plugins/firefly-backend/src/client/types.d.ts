export interface FireflyAsset {
    vcsRepo: string;
    resourceCreationDate: number;
    lastResourceStateChange: number;
    assetId: string;
    assetType: string;
    name: string;
    vcsProvider: string;
    providerId: string;
    iacType: string;
    state: string;
    resourceId: string;
    arn: string;
    terraformModule: string;
    terraformObjectName: string;
    deleteCommand: string;
    stateLocationString: string;
    owner: string;
    tfObject: Record<string, any>;
  
    vcsCodeLink: string;
    consoleURL: string;
    fireflyLink: string;
    tagsList: string[];
    region: string;
    fireflyAssetId: string;
    connectionSources: string[];
    connectionTargets: string[];
  }
  
  export interface FireflyInventoryResponse {
    responseObjects: FireflyAsset[];
    totalObjects: number;
    afterKey: string;
  }
  
  export interface FireflyAggregation {
    type: string;
    count: number;
    details: Record<string, any>;
  }
  
  export interface FireflyAssetFilters {
    afterKey?: string;
    size?: number;
    source?: string[];
    providerTypes?: Record<string, any>;
    sorting?: {
      field: string;
      order: 'asc' | 'desc';
    };
    assetState?: 'managed' | 'unmanaged' | 'ghost' | 'modified';
    assetTypes?: string[];
    providerIds?: string[];
    names?: string[];
    arns?: string[];
    dayRangeEpoch?: number;
  }