import React from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import '@testing-library/jest-dom';
import { FireflyPage } from './FireflyPage';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model/index';

// Mock the Pie component from @ant-design/plots for the IaCCoveragePieChart
jest.mock('@ant-design/plots', () => ({
    Pie: () => <div data-testid="mock-pie-chart">Pie Chart</div>,
}));

describe('FireflyPage', () => {
    // Mock data setup
    const mockCatalogApi = {
        getEntities: jest.fn(),
    };

    const renderComponent = async () => {
        return renderInTestApp(
            <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
                <FireflyPage />
            </TestApiProvider>
        );
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should show loading state initially', async () => {
        // Create a promise that won't resolve during the test
        const loadingPromise = new Promise(() => { });
        mockCatalogApi.getEntities.mockImplementation(() => loadingPromise);

        await renderComponent();
        expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error state when API call fails', async () => {
        const error = new Error('Failed to fetch');
        mockCatalogApi.getEntities.mockRejectedValue(error);

        await renderComponent();
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    it('should render page with data successfully', async () => {
        // Mock getEntities responses for both resource and system entities
        const mockResources = [{  }, {  } as unknown as Entity];
        const mockSystems = [{  } as unknown as Entity];

        mockCatalogApi.getEntities
            .mockResolvedValueOnce({ items: mockResources }) // Resources
            .mockResolvedValueOnce({ items: mockSystems }); // Systems

        await renderComponent();

        // Check if header is rendered
        expect(screen.getByText('Firefly')).toBeInTheDocument();
        expect(screen.getByText('Resources visibility and IaC coverage metrics')).toBeInTheDocument();

        // Check if total counts are rendered
        expect(screen.getByText('2')).toBeInTheDocument(); // Total Resources
        expect(screen.getByText('1')).toBeInTheDocument(); // Total Systems

        // Check if charts are rendered
        expect(screen.getByText('Resources IaC Coverage')).toBeInTheDocument();
    });

    it('should handle empty data correctly', async () => {
        // Mock API responses with empty arrays
        mockCatalogApi.getEntities
            .mockResolvedValueOnce({ items: [] }) // Empty resources
            .mockResolvedValueOnce({ items: [] }); // Empty systems

        await renderComponent();

        // Check if the page still renders with zero counts
        expect(screen.getAllByText('0')).toHaveLength(2); // Should show 0 for both totals
    });

    it('should make correct getEntities calls with filters', async () => {
        mockCatalogApi.getEntities
            .mockResolvedValueOnce({ items: [] })
            .mockResolvedValueOnce({ items: [] });

        await renderComponent();

        // Verify the getEntities was called with correct filters
        expect(mockCatalogApi.getEntities).toHaveBeenCalledWith({
            filter: {
                kind: 'Resource',
                'metadata.annotations.firefly.ai/managed-by-firefly': 'true'
            }
        });

        expect(mockCatalogApi.getEntities).toHaveBeenCalledWith({
            filter: {
                kind: 'System',
                'metadata.annotations.firefly.ai/managed-by-firefly': 'true'
            }
        });
    });
}); 