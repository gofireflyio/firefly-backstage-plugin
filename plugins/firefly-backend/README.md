# Firefly Backend Plugin

This plugin integrates Firefly.ai with Backstage, allowing you to import Firefly assets as catalog entities.

## Installation

1. Install the plugin package:
   ```bash
   yarn add @internal/plugin-firefly-backend
   ```

2. Authenticate with Firefly:
   ```bash
   export FIREFLY_ACCESS_KEY=<your-access-key>
   export FIREFLY_SECRET_KEY=<your-secret-key>
   ```

3. Configure the plugin in your `app-config.yaml`:
   ```yaml
   firefly:
     periodicCheck:
       interval: 3600  # seconds (default: 3600)
       filters:
         # Optional filters to apply when fetching assets
         tags:
           environment: production
         assetTypes:
           - aws_s3_bucket
           - aws_lambda_function
         cloudAccounts:
           - '123456789012'
   ```

4. Add the plugin to your backend:
   ```typescript
   // In packages/backend/src/index.ts or equivalent
   import { createBackend } from '@backstage/backend-defaults';
   import { catalogFireflyBackendModule } from '@internal/plugin-firefly-backend';

   const backend = createBackend();
   backend.add(import('@backstage/plugin-catalog-backend/alpha'));
   backend.add(catalogFireflyBackendModule);
   
   backend.start();
   ```

## Features

- Imports Firefly assets as Backstage catalog entities
- Periodically refreshes assets based on configured interval
- Supports filtering assets by tags, asset types, and cloud accounts
- Maps Firefly asset metadata to Backstage entity annotations