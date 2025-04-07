[![Firefly](https://infralight-templates-public.s3.amazonaws.com/company-logos/firefly_logo_white.png)](https://firefly.ai)

# Firefly Frontend Plugin

This plugin integrates Firefly.ai with Backstage, providing a frontend interface to view and manage your cloud infrastructure resources. The plugin works in conjunction with the Firefly backend plugin to display cloud resources, their relationships, and IaC coverage within your Backstage instance.

## Features

- Dedicated Firefly page for cloud resource key metrics
- Integration with entity pages to show IaC coverage per component

## Installation

1. Install the plugin package:
```bash
yarn add @fireflyai/backstage-plugin-firefly
```

2. Configure the plugin in your Backstage app:

```typescript
// In packages/app/src/App.tsx
import { FireflyPage } from '@fireflyai/backstage-plugin-firefly';

// Add to your app's routes
<Route path="/firefly" element={<FireflyPage />} />
```

3. Add the Firefly icon to your sidebar:

```typescript
// In packages/app/src/components/Root/Root.tsx
import ExtensionIcon from '@material-ui/icons/Extension';

// Add to your sidebar items
<SidebarItem icon={ExtensionIcon} to="firefly" text="Firefly" />
```

4. Add the IaC coverage card to entity pages:

```typescript
// In packages/app/src/components/catalog/EntityPage.tsx
import { EntityDependenciesIaCCoverageCard } from '@fireflyai/backstage-plugin-firefly';

// Add to your entity page layout
<Grid item md={4} xs={12}>
  <EntityDependenciesIaCCoverageCard />
</Grid>
```

## Usage

### Firefly Page

The Firefly page (`/firefly`) provides a centralized view of your cloud infrastructure. Here you can:
- View number of cloud resources and systems
- Monitor IaC coverage across your entire cloud infrastructure
- View top 5 components with unmanaged, drifted and overall resources

### Entity Integration

The plugin integrates with Backstage's entity pages by adding:
- IaC coverage information for components

## Dependencies

This frontend plugin requires:
- The Firefly backend plugin to be installed and configured
- Proper authentication setup with Firefly.ai
- Backstage core components

## Related Plugins

- [@fireflyai/backstage-backend-plugin-firefly](../firefly-backend/README.md) - Required backend plugin that provides data integration with Firefly.ai