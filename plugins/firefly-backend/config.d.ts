/**
 * Configuration schema for the Firefly backend plugin.
 * This defines the expected structure of the configuration in app-config.yaml.
 */
export interface Config {
  /**
   * Configuration for the Firefly integration
   */
  firefly?: {
    /**
     * Configuration for periodic checking of Firefly assets
     */
    periodicCheck?: {
      /**
       * Interval in seconds between checks (default: 3600)
       */
      interval?: number;
      /**
       * Import systems from Firefly
       */
      importSystems?: boolean;
      /**
       * Import resources from Firefly
       */
      importResources?: boolean;
      /**
       * If a resource tag value is equals to the component name, relate the resource to that component
       */
      correlateByComponentName?: boolean;
      /**
       * Tag keys to use as identifiers for relating resources to their corresponding components
       */
      tagKeysIdentifiers?: string[];
      /**
       * Filters to apply when fetching assets from Firefly
       */
      filters?: {
        /**
         * Filter assets by asset types
         */
        assetTypes?: string[];
        /**
         * Filter assets by provider ids
         */
        providerIds?: string[];
        /**
         * Include resources configuration to be added to the resources entities description. Default is true. 
         */
        includeConfiguration?: boolean;
      };
    };
  };
}
