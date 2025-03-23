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
      };
    };
  };
}
