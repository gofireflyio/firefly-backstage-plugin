import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { FireflyEntityProvider } from './FireflyEntityProvider';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { FireflyClient } from './fireflyClient';

export const catalogFireflyBackendModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'firefly',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({
        catalog,
        config,
        logger,
        httpRouter,
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

        httpRouter.use(
          await createRouter({
            config,
            logger,
            fireflyClient
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        const fireflyEntityProvider = new FireflyEntityProvider({
          fireflyClient,
          config,
          logger,
        });

        catalog.addEntityProvider(fireflyEntityProvider);
      },
    });
  },
}); 