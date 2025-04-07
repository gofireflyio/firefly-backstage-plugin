import { createPlugin } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { createComponentExtension } from '@backstage/core-plugin-api';

/**
 * The Firefly plugin for Backstage
 * This plugin provides integration with Firefly's asset management system   
 */ 
export const fireflyPlugin = createPlugin({
  id: 'firefly',
  apis: [
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Entity overview card that shows IaC coverage for compoenent dependent resources
 */
export const EntityDependenciesIaCCoverageCard = fireflyPlugin.provide(
  createComponentExtension({
    name: 'EntityDependenciesIaCCoverageCard',
    component: {
      lazy: () =>
        import('./components/DependenciesIaCCoverageCard/DependencyLifecycleCard').then(
          m => m.DependenciesIaCCoverageCard,
        ),
    },
  }),
);

export const FireflyPage = fireflyPlugin.provide(
  createComponentExtension({
    name: 'FireflyPage',
    component: { lazy: () => import('./components/FireflyPage/FireflyPage').then(m => m.FireflyPage) },
  }),
);