[![Firefly](https://infralight-templates-public.s3.amazonaws.com/company-logos/firefly_logo_white.png)](https://firefly.ai)

# Firefly Backend Plugin

This plugin integrates Firefly.ai with Backstage, allowing you to import Firefly assets as catalog resource entities and import cloud accounts as systems. The plugin establishes relationships between these entities, enabling you to visualize dependencies between cloud resources and systems. These relationships help track ownership, dependencies, and provide a comprehensive view of your cloud infrastructure within the Backstage ecosystem.

Additionally, the plugin automatically relates existing components in your catalog to their corresponding cloud resources and cloud accounts using two methods:
1. **Tag-based correlation**: Using the `tagKeysIdentifiers` configuration, the plugin finds components with matching tag key-value pairs. For example, with `tagKeysIdentifiers: ['environment', 'component']`, it creates relationships between components and Firefly resources that share these tag values.
2. **Name-based correlation**: When `correlateByComponentName` is enabled, the plugin relates resources to components when a resource tag value matches a component name in your catalog.
Both methods create a complete picture of your application architecture from software components down to the underlying infrastructure without manual configuration of each relationship.

## Installation

1. Install the plugin package:
   ```bash
   yarn add @fireflyai/backstage-backend-plugin-firefly
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
       correlateByComponentName: true  # if a resource tag value is equals to the component name, relate the resource to that component
       importResources: true  # import assets as resources
       tagKeysIdentifiers: # Optional:tag keys to use as identifiers for relating resources to their corresponding components
         - environment
         - component
       filters:
         # Optional filters to apply when fetching assets
         assetTypes:
           - aws_s3_bucket
           - aws_lambda_function
         providerIds:
           - '123456789012'  
           - 'devops-651215'  
   ```

4. Add the plugin to your backend:
  ```typescript
  // In packages/backend/src/index.ts or equivalent add the following:
  backend.add(import('@fireflyai/backstage-backend-plugin-firefly'));
  ```

## Features

- Imports Firefly assets as Backstage catalog resource entities
- Periodically refreshes assets based on configured interval
- Supports filtering assets by asset types and provider IDs
- Creates system entities to represent cloud accounts
- Captures resource relationships and dependencies
- Automatically relates existing components in your catalog to their corresponding cloud resources and cloud accounts

## Related Plugins

- [@fireflyai/backstage-plugin-firefly](../firefly/README.md) - Frontend plugin for visualizing Firefly data in Backstage