import express from 'express';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { FireflyClient } from './fireflyClient';

/**
 * @internal
 * */
export interface RouterOptions {
  fireflyClient: FireflyClient;
  logger: LoggerService;
  config: Config;
}

/**
 * @internal
 * */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, fireflyClient } = options;
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Get Firefly inventory assets with filters
  router.get('/assets', async (req, res) => {
    try {
      const { tags, assetTypes, cloudAccounts } = req.query;
      const assets = await fireflyClient.getAssets({
        tags: tags ? JSON.parse(tags as string) : undefined,
        assetTypes: assetTypes ? JSON.parse(assetTypes as string) : undefined,
        cloudAccounts: cloudAccounts ? JSON.parse(cloudAccounts as string) : undefined,
      });
      res.json(assets);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Error fetching Firefly assets:', error);
      res.status(500).json({ error: 'Failed to fetch Firefly assets' });
    }
  });

  // Get Firefly inventory aggregations
  router.get('/aggregations', async (req, res) => {
    try {
      const { tags, assetTypes, cloudAccounts } = req.query;
      const aggregations = await fireflyClient.getAggregations({
        tags: tags ? JSON.parse(tags as string) : undefined,
        assetTypes: assetTypes ? JSON.parse(assetTypes as string) : undefined,
        cloudAccounts: cloudAccounts ? JSON.parse(cloudAccounts as string) : undefined,
      });
      res.json(aggregations);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Error fetching Firefly aggregations:', error);
      res.status(500).json({ error: 'Failed to fetch Firefly aggregations' });
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}
