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
        const fireflyClient = new FireflyClient({
          accessKey: config.getString('firefly.accessKey'),
          secretKey: config.getString('firefly.secretKey'),
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