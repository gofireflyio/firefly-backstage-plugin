import React from 'react';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { TopFiveComponentsItem } from './TopFiveComponentsItem';
import {
  EmptyState,
  InfoCard,
} from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import { useStyles, colors } from './TopFiveComponents.styles';
import { AccountTree } from '@mui/icons-material';
import { capitalize } from '../common';
// Props interface for the component
interface TopFiveComponentsProps {
  type: string;
  entities: Entity[];
}

// Interface for component data structure
interface ComponentData {
  name: string;
  resourceCount: number;
}

/**
 * Component that displays the top 5 components with the most associated resources or unmanaged resources or drifted resources
 */
export const TopFiveComponents: React.FC<TopFiveComponentsProps> = ({ type, entities }) => {
  const [data, setData] = useState<ComponentData[]>([]);
  const classes = useStyles();

  /**
   * Processes entities data to extract component relationships and resource counts
   */
  useEffect(() => {
    if (!entities?.length) return;

    // Create a map to store component data
    const componentMap = new Map<string, ComponentData>();

    // Process each entity to find component references
    entities.forEach(entity => {
      switch (type) {
        case 'unmanaged':
          if (entity.spec?.lifecycle !== 'unmanaged') return;
          break;
        case 'drifted':
          if (entity.spec?.lifecycle !== 'drifted') return;
          break;
        default:
          break;
      }

      const dependencyOf = entity.spec?.dependencyOf || [];

      // Find component references in dependencyOf
      const componentRefs = (dependencyOf as string[]).filter((ref: string) => ref.startsWith('component:'));

      componentRefs.forEach((componentRef: string) => {
        // Extract component name from reference
        const componentName = componentRef.replace('component:', '');

        // Get or create component data
        const componentData = componentMap.get(componentName) || {
          name: componentName,
          resourceCount: 0,
        };

        // Update resource count and types
        componentData.resourceCount += 1;
        componentMap.set(componentName, componentData);
      });
    });

    // Convert map to array and sort by resource count
    const sortedData = Array.from(componentMap.values())
      .sort((a, b) => b.resourceCount - a.resourceCount)
      .slice(0, 5); // Get top 5

    setData(sortedData);
  }, [entities, type]);

  /**
   * Renders the list of top components
   */
  const renderList = () => {
    return data.map((item) => (
      <TopFiveComponentsItem
        key={item.name}
        name={item.name}
        count={item.resourceCount}
        color={colors[type]}
      />
    ));
  };

  if (_.isEmpty(data)) {
    return (
      <InfoCard title={`Top 5 Components with ${type !== "resources" ? `${capitalize(type)} ` : ""}Resources`}>
        <EmptyState
          missing="data"
          title={`No Components with ${type !== "resources" ? `${capitalize(type)} ` : ""}Resources Found`}
          description={`Couldn't find any components with ${type !== "resources" ? `${type} ` : ""}resources associated.`}
        />
      </InfoCard>
    );
  }

  return (
    <InfoCard title={`Top 5 Components with ${type !== "resources" ? `${capitalize(type)} ` : ""}Resources`}>
      <div className={`${classes.topFiveComponents} ${classes.basicCard} ${classes.row}`}>
        <span className={classes.line} style={{ backgroundColor: colors[type] }} />
        <span>
          <span className={`${classes.circle} ${classes.center}`} style={{ backgroundColor: colors[type] }}>
            <AccountTree className={classes.circleIcon} />
          </span>
        </span>
        <div className={`${classes.list} ${classes.col}`}>{renderList()}</div>
      </div>
    </InfoCard>
  );
};

export default TopFiveComponents; 