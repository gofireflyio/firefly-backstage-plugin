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

## Entity Model

Firefly assets are imported as `Resource` entities with the following structure:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: <asset-identifier>
  annotations:
    firefly.ai/asset-id: <asset-identifier>
    firefly.ai/cloud-link: <link-to-cloud-console>
    firefly.ai/code-link: <link-to-code-repository>
    firefly.ai/firefly-link: <link-to-firefly-dashboard>
spec:
  type: firefly-asset
  owner: firefly-plugin
  system: firefly
  lifecycle: production
  dependsOn: []
  tags: <asset-tags>
```

### Fields Description

- `metadata.name`: The unique identifier of the Firefly asset
- `metadata.annotations`:
  - `firefly.ai/asset-id`: The asset's unique identifier in Firefly
  - `firefly.ai/cloud-link`: Direct link to the asset in cloud provider's console
  - `firefly.ai/code-link`: Link to the associated code repository
  - `firefly.ai/firefly-link`: Link to view the asset in Firefly dashboard
- `spec`:
  - `type`: Always set to 'firefly-asset'
  - `owner`: Set to 'firefly-plugin'
  - `system`: Set to 'firefly'
  - `lifecycle`: Set to 'production'
  - `dependsOn`: Array of dependencies (currently empty)
  - `tags`: Key-value pairs of tags associated with the asset
