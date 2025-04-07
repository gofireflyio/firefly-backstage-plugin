import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { FireflyEntityProvider } from './entityProvider/fireflyEntityProvider';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { FireflyClient } from './client/fireflyClient';

export const catalogFireflyBackendModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'firefly',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        catalogService: catalogServiceRef,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({
        catalog,
        config,
        logger,
        auth,
        catalogService,
      }) {
        // Get the access key and secret key from the environment variables 
        const accessKey = process.env.FIREFLY_ACCESS_KEY;
        const secretKey = process.env.FIREFLY_SECRET_KEY;

        if (!accessKey || !secretKey) {
          logger.error('Firefly access key and secret key are not set');
          throw new Error('Firefly access key and secret key are not set');
        }

        const fireflyClient = new FireflyClient({
          logger,
          accessKey,
          secretKey,
        });

        const fireflyEntityProvider = new FireflyEntityProvider({
          fireflyClient,
          auth,
          catalogService,
          config,
          logger,
        });

        catalog.addEntityProvider(fireflyEntityProvider);
      },
    });
  },
}); 