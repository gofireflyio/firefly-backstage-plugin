# Firefly Backend Plugin

# Firefly Backend Plugin

This plugin integrates Firefly.ai with Backstage, allowing you to import Firefly assets as catalog entities and import cloud accounts as systems. The plugin establishes relationships between these entities, enabling you to visualize dependencies between cloud resources and systems. These relationships help track ownership, dependencies, and provide a comprehensive view of your cloud infrastructure within the Backstage ecosystem.

Additionally, the plugin automatically relates existing components in your catalog to their corresponding cloud resources and cloud accounts using tags configured on both the resources and the component. This means that if you have software components already defined in your Backstage catalog with specific tags, the plugin will create relationships between these components and the Firefly-discovered resources that share matching tags, as well as to the cloud accounts where they are deployed. This tag-based automatic relationship mapping provides a complete picture of your application architecture from software components all the way down to the underlying infrastructure, without requiring manual configuration of each relationship.

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
       importSystems: true  # import cloud accounts as systems
       importResources: true  # import assets as resources
       filters:
         # Optional filters to apply when fetching assets
         tags:
           environment: production
         assetTypes:
           - aws_s3_bucket
           - aws_lambda_function
         providerIds:
           - '123456789012'  
           - 'devops-651215'  
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
- Supports filtering assets by tags, asset types, and provider IDs
- Creates system entities to represent cloud accounts
- Maps Firefly asset metadata to Backstage entity annotations
- Captures resource relationships and dependencies
- Automatically relates existing components in your catalog to their corresponding cloud resources and cloud accounts using tags configured on both the resources and the component.