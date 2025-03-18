import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { createApiFactory, createComponentExtension } from '@backstage/core-plugin-api';
import { fireflyApiRef, FireflyClient } from './api/client';
import { rootRouteRef } from './routes';

/**
 * The Firefly plugin for Backstage
 * This plugin provides integration with Firefly's asset management system
 */
export const fireflyPlugin = createPlugin({
  id: 'firefly',
  apis: [
    createApiFactory({
      api: fireflyApiRef,
      deps: {},
      factory: () => new FireflyClient(),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * The main Firefly page component
 * This is the standalone page that shows all Firefly assets
 */
export const FireflyPage = fireflyPlugin.provide(
  createRoutableExtension({
    name: 'FireflyPage',
    component: () => import('./components/FireflyPage').then(m => m.FireflyPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * A component that displays Firefly content within an entity page
 * This is used to show Firefly-specific information in the context of a Backstage entity
 */
export const EntityFireflyContent = fireflyPlugin.provide(
  createComponentExtension({
    name: 'EntityFireflyContent',
    component: {
      lazy: () => import('./components/EntityFireflyContent').then(m => m.EntityFireflyContent),
    },
  }),
);

/**
 * A component that displays a summary of Firefly information
 * This is used to show a condensed view of Firefly data in entity cards and lists
 */
export const EntityFireflySummary = fireflyPlugin.provide(
  createComponentExtension({
    name: 'EntityFireflySummary',
    component: {
      lazy: () => import('./components/EntityFireflySummary').then(m => m.EntityFireflySummary),
    },
  }),
);
