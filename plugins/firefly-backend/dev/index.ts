import { createBackend } from '@backstage/backend-defaults';
import { catalogFireflyBackendModule } from '../src/module';

const backend = createBackend();

backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(catalogFireflyBackendModule);

backend.start();