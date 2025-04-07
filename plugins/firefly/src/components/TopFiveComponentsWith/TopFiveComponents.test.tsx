import React from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import '@testing-library/jest-dom';
import { TopFiveComponents } from './TopFiveComponents';
import { Entity } from '@backstage/catalog-model';

describe('TopFiveComponents', () => {
  // Helper function to render the component
  const renderComponent = async (entities: Entity[] = [], type: string = "resources") => {
    return renderInTestApp(
      <TopFiveComponents type={type} entities={entities} />
    );
  };

  it('should show empty state when no entities are provided', async () => {
    await renderComponent([], "resources");
    expect(screen.getByText('No Components with Resources Found')).toBeInTheDocument();
    expect(screen.getByText('Couldn\'t find any components with resources associated.')).toBeInTheDocument();
  });

  it('should render components with their resource counts', async () => {
    const mockEntities = [
      {
        spec: {
          dependencyOf: ['component:test-component-1', 'component:test-component-2']
        }
      },
      {
        spec: {
          dependencyOf: ['component:test-component-1', 'component:test-component-3']
        }
      },
      {
        spec: {
          dependencyOf: ['component:test-component-2']
        }
      },
      {
        spec: {
          dependencyOf: ['component:test-component-2']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities);
    
    // Component 1 should have 2 resources
    expect(screen.getByText('test-component-1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Component 2 should have 2 resources
    expect(screen.getByText('test-component-2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Component 3 should have 1 resource
    expect(screen.getByText('test-component-3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should only show top 5 components when more exist', async () => {
    const mockEntities = [
      {
        spec: {
          dependencyOf: ['component:comp-1', 'component:comp-2', 'component:comp-3',
                        'component:comp-4', 'component:comp-5', 'component:comp-6']
        }
      },
      {
        spec: {
          dependencyOf: ['component:comp-1']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities);

    // Should show first 5 components
    expect(screen.getByText('comp-1')).toBeInTheDocument();
    expect(screen.getByText('comp-2')).toBeInTheDocument();
    expect(screen.getByText('comp-3')).toBeInTheDocument();
    expect(screen.getByText('comp-4')).toBeInTheDocument();
    expect(screen.getByText('comp-5')).toBeInTheDocument();

    // Should not show the 6th component
    expect(screen.queryByText('comp-6')).not.toBeInTheDocument();
  });

  it('should handle entities without dependencyOf field', async () => {
    const mockEntities = [
      {
        spec: {}
      },
      {
        spec: {
          dependencyOf: ['component:test-component']
        }
      }
    ] as Entity[];

    await renderComponent(mockEntities);
    
    // Should still render the component with dependencies
    expect(screen.getByText('test-component')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should sort components by resource count in descending order', async () => {
    const mockEntities = [
      {
        spec: {
          dependencyOf: ['component:comp-1']
        }
      },
      {
        spec: {
          dependencyOf: ['component:comp-2', 'component:comp-2']
        }
      },
      {
        spec: {
          dependencyOf: ['component:comp-3', 'component:comp-3', 'component:comp-3']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities);
    
    const listItems = screen.getAllByText(/comp-[1-3]/);
    
    // Components should be ordered by count (3, 2, 1)
    expect(listItems[0]).toHaveTextContent('comp-3');
    expect(listItems[1]).toHaveTextContent('comp-2');
    expect(listItems[2]).toHaveTextContent('comp-1');
  });

  it('should filter and show only unmanaged resources', async () => {
    const mockEntities = [
      {
        spec: {
          lifecycle: 'unmanaged',
          dependencyOf: ['component:comp-1', 'component:comp-2']
        }
      },
      {
        spec: {
          lifecycle: 'managed',
          dependencyOf: ['component:comp-1']
        }
      },
      {
        spec: {
          lifecycle: 'unmanaged',
          dependencyOf: ['component:comp-2']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities, 'unmanaged');
    
    // Should show components with unmanaged resources
    expect(screen.getByText('comp-2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // comp-2 has 2 unmanaged resources
    expect(screen.getByText('comp-1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // comp-1 has 1 unmanaged resource

    // Title should reflect unmanaged resources
    expect(screen.getByText('Top 5 Components with Unmanaged Resources')).toBeInTheDocument();
  });

  it('should filter and show only drifted resources', async () => {
    const mockEntities = [
      {
        spec: {
          lifecycle: 'drifted',
          dependencyOf: ['component:comp-1', 'component:comp-2']
        }
      },
      {
        spec: {
          lifecycle: 'managed',
          dependencyOf: ['component:comp-1']
        }
      },
      {
        spec: {
          lifecycle: 'drifted',
          dependencyOf: ['component:comp-2', 'component:comp-3']
        }
      },
      {
        spec: {
          lifecycle: 'drifted',
          dependencyOf: ['component:comp-2', 'component:comp-1']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities, 'drifted');
    
    // Should show components with drifted resources
    expect(screen.getByText('comp-2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // comp-2 has 3 drifted resources
    expect(screen.getByText('comp-1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // comp-1 has 2 drifted resource
    expect(screen.getByText('comp-3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // comp-3 has 1 drifted resource

    // Title should reflect drifted resources
    expect(screen.getByText('Top 5 Components with Drifted Resources')).toBeInTheDocument();
  });

  it('should show empty state when no unmanaged resources exist', async () => {
    const mockEntities = [
      {
        spec: {
          lifecycle: 'managed',
          dependencyOf: ['component:comp-1']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities, 'unmanaged');
    
    expect(screen.getByText('No Components with Unmanaged Resources Found')).toBeInTheDocument();
    expect(screen.getByText('Couldn\'t find any components with unmanaged resources associated.')).toBeInTheDocument();
  });

  it('should show empty state when no drifted resources exist', async () => {
    const mockEntities = [
      {
        spec: {
          lifecycle: 'managed',
          dependencyOf: ['component:comp-1']
        }
      }
    ] as unknown as Entity[];

    await renderComponent(mockEntities, 'drifted');
    
    expect(screen.getByText('No Components with Drifted Resources Found')).toBeInTheDocument();
    expect(screen.getByText('Couldn\'t find any components with drifted resources associated.')).toBeInTheDocument();
  });
}); 