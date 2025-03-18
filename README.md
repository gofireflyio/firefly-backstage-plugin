# Firefly Backstage Plugin

This plugin integrates Firefly.ai with Backstage, providing a seamless way to view and manage your Firefly assets within the Backstage UI.

## Features

### Backend

- API endpoints for fetching Firefly inventory assets and aggregations
- Support for filtering assets by:
  - Tags (key-value pairs)
  - Asset types
  - Cloud accounts
- Periodic check for new assets (configurable)
- Automatic creation and deletion of Backstage Resources based on Firefly assets
- Tag-based linking between Backstage services and Firefly assets

### Frontend

- Firefly tab on every service component
- Tag value field for existing components
- Table view of Firefly assets with:
  - Asset metadata
  - Status information
  - Links to cloud, code, and Firefly
- Summary view of IaC status for assets
- Relationship visualization between services and assets

## Installation

1. Install the plugin:

```bash
yarn add @backstage/plugin-firefly @backstage/plugin-firefly-backend
```

2. Add the backend plugin to your `packages/backend/src/plugins/firefly.ts`:

```typescript
import { createRouter } from '@backstage/plugin-firefly-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    catalog: env.catalog,
  });
}
```

3. Add the frontend plugin to your `packages/app/src/App.tsx`:

```typescript
import { fireflyPlugin } from '@backstage/plugin-firefly';

// Add to your plugins array
const plugins = [
  // ... other plugins
  fireflyPlugin,
];
```

4. Configure the plugin in your `app-config.yaml`:

```yaml
firefly:
  accessKey: ${FIREFLY_ACCESS_KEY}
  secretKey: ${FIREFLY_SECRET_KEY}
  periodicCheck:
    interval: 3600  # Check every hour
    filters:
      tags:
        environment: production
      assetTypes:
        - ec2
        - s3
      cloudAccounts:
        - aws-account-1
        - aws-account-2
```

## Usage

### Adding Firefly Tags to Services

To link a Backstage service with Firefly assets, add the following annotations to your service's `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Service
metadata:
  name: my-service
  annotations:
    firefly.ai/tag-key: service
    firefly.ai/tag-value: my-service
```

### Viewing Firefly Information

1. Navigate to any service in the Backstage catalog
2. Click on the "Firefly" tab to see associated assets
3. View the summary card on the main tab for a quick overview
4. Access the full Firefly inventory through the main Firefly page

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the Apache-2.0 License.
