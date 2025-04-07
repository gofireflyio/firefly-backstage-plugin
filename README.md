[![Firefly](https://infralight-templates-public.s3.amazonaws.com/company-logos/firefly_logo_white.png)](https://firefly.ai)

# Firefly Backstage Plugin

This plugin integrates Firefly.ai with Backstage, providing a seamless way to view and manage your cloud infrastructure resources within the Backstage UI. The plugin consists of both frontend and backend components that work together to provide comprehensive cloud resource management capabilities.

## Available Plugins

- [Firefly Frontend Plugin](./plugins/firefly/README.md) - Frontend interface to view and manage your cloud infrastructure resources within Backstage
- [Firefly Backend Plugin](./plugins/firefly-backend/README.md) - Backend integration for importing and managing Firefly assets as Backstage catalog entities

## Features

### Backend Features

- Import Firefly assets as catalog resource entities
- Import cloud accounts as system entities
- Automatic relationship mapping between:
  - Cloud resources and systems
  - Existing components and cloud resources
  - Dependencies between cloud resources
- Support for filtering assets by:
  - Asset types
  - Cloud accounts
- Periodic check for new assets (configurable interval)
- Tag-based and name-based correlation between components and resources

### Frontend Features

- Dedicated Firefly page showing:
  - Cloud resource key metrics
  - Number of cloud resources and systems
  - IaC coverage across infrastructure
  - Top 5 components with unmanaged/drifted and overall resources
- Service component integration:
  - IaC coverage information
 
## Demo

https://github.com/user-attachments/assets/6e533ca8-964b-49c7-aa7b-5f0d1cc5d23f

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

## Support

For support and questions:

- Open an issue in the GitHub repository
- Contact Firefly.ai support at [support@firefly.ai](mailto:support@firefly.ai)
- Check our documentation at [Firefly Docs](https://docs.firefly.ai)

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (format: `feat:<description>`)
3. Make your changes
   - Add appropriate comments to all code
   - Follow existing code style and conventions
   - Add/update tests as needed
4. Commit your changes (format: "feat:<description>")
5. Submit a pull request
6. Wait for review and address any feedback

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
