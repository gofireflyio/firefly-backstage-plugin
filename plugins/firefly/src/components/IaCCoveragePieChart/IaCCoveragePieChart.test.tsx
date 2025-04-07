import React from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import '@testing-library/jest-dom';
import { IaCCoveragePieChart } from './IaCCoveragePieChart';

// Mock the Pie component from @ant-design/plots
jest.mock('@ant-design/plots', () => ({
    Pie: () => <div data-testid="mock-pie-chart">Pie Chart</div>,
}));

describe('IaCCoveragePieChart', () => {
    // Helper function to render the component
    const renderComponent = async (relatedEntities: any[] = []) => {
        return renderInTestApp(
            <IaCCoveragePieChart relatedEntities={relatedEntities} />
        );
    };

    it('should show empty state when no entities are provided', async () => {
        await renderComponent([]);
        expect(screen.getByText('No Resource Dependencies Found')).toBeInTheDocument();
        expect(screen.getByText('This entity does not have any resource dependencies defined in the catalog.')).toBeInTheDocument();
    });

    it('should render pie chart with managed and unmanaged resources', async () => {
        const mockEntities = [
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test1' }
                },
                spec: { lifecycle: 'managed' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test2' }
                },
                spec: { lifecycle: 'unmanaged' }
            }
        ];

        await renderComponent(mockEntities);
        expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
        expect(screen.getByText('Resources IaC Coverage')).toBeInTheDocument();
    });

    it('should skip entities without firefly.ai/asset-id annotation', async () => {
        const mockEntities = [
            {
                metadata: { annotations: {} },
                spec: { lifecycle: 'managed' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test1' }
                },
                spec: { lifecycle: 'managed' }
            }
        ];

        await renderComponent(mockEntities);
        expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });

    it('should handle all lifecycle states correctly', async () => {
        const mockEntities = [
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test1' }
                },
                spec: { lifecycle: 'managed' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test2' }
                },
                spec: { lifecycle: 'unmanaged' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test3' }
                },
                spec: { lifecycle: 'ghost' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test4' }
                },
                spec: { lifecycle: 'drifted' }
            },
            {
                metadata: { 
                    annotations: { 'firefly.ai/asset-id': 'test5' }
                },
                spec: { lifecycle: 'undetermined' }
            }
        ];

        await renderComponent(mockEntities);
        expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });
}); 