import { fireflyPlugin, EntityDependenciesIaCCoverageCard } from './plugin';

/**
 * Test suite for the Firefly plugin
 */
describe('firefly-plugin', () => {
  /**
   * Test that the main plugin is properly exported and defined
   */
  it('should export plugin', () => {
    expect(fireflyPlugin).toBeDefined();
  });

  /**
   * Test that the EntityDependenciesIaCCoverageCard component extension is properly exported and defined
   */
  it('should export EntityDependenciesIaCCoverageCard extension', () => {
    expect(EntityDependenciesIaCCoverageCard).toBeDefined();
  });
}); 