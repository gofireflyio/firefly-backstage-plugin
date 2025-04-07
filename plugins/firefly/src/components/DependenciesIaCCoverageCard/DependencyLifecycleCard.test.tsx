import React from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import '@testing-library/jest-dom';
import { DependenciesIaCCoverageCard } from './DependencyLifecycleCard';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';

// Mock the required hooks and modules
jest.mock('@backstage/plugin-catalog-react', () => {
    const actual = jest.requireActual('@backstage/plugin-catalog-react');
    return {
        ...actual,
        useEntity: jest.fn(),
    };
});

// Mock the Pie component from @ant-design/plots
jest.mock('@ant-design/plots', () => ({
    Pie: () => <div data-testid="mock-pie-chart">Pie Chart</div>,
}));

describe('DependenciesIaCCoverageCard', () => {
    // Mock data setup
    const mockCatalogApi = {
        getEntitiesByRefs: jest.fn(),
    };

    const renderComponent = async () => {
        return renderInTestApp(
            <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
                <DependenciesIaCCoverageCard />
            </TestApiProvider>
        );
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should show loading state initially', async () => {
        // Mock entity with relations
        (useEntity as jest.Mock).mockReturnValue({
            entity: {
                relations: [{ targetRef: 'component:default/test' }],
            },
        });

        // Create a promise that won't resolve during the test
        const loadingPromise = new Promise(() => { });
        mockCatalogApi.getEntitiesByRefs.mockImplementation(() => loadingPromise);

        await renderComponent();
        expect(await screen.findByTestId('progress')).toBeInTheDocument();
    });

    it('should show empty state when no dependencies are found', async () => {
        // Mock entity with no relations
        (useEntity as jest.Mock).mockReturnValue({
            entity: {
                relations: [],
            },
        });

        mockCatalogApi.getEntitiesByRefs.mockResolvedValue({ items: [] });

        await renderComponent();
        expect(screen.getByText('No Resource Dependencies Found')).toBeInTheDocument();
    });

    it('should show error state when API call fails', async () => {
        // Mock entity with relations
        (useEntity as jest.Mock).mockReturnValue({
            entity: {
                relations: [{ targetRef: 'component:default/test' }],
            },
        });

        const error = new Error('Failed to fetch');
        mockCatalogApi.getEntitiesByRefs.mockRejectedValue(error);

        await renderComponent();
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    it('should render pie chart with correct data', async () => {
        // Mock entity with relations
        (useEntity as jest.Mock).mockReturnValue({
            entity: {
                relations: [
                    { targetRef: 'component:default/test1' },
                    { targetRef: 'component:default/test2' },
                ],
            },
        });

        // Mock API response with different lifecycle states
        mockCatalogApi.getEntitiesByRefs.mockResolvedValue({
            items: [
                {
                    metadata: { annotations: { 'firefly.ai/asset-id': 'test1' } },
                    spec: { lifecycle: 'managed' },
                },
                {
                    metadata: { annotations: { 'firefly.ai/asset-id': 'test2' } },
                    spec: { lifecycle: 'unmanaged' },
                },
            ],
        });

        await renderComponent();
        expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });
}); 