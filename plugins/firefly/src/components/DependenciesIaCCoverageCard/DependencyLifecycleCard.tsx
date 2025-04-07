import React, { useEffect, useState } from 'react';
import {
    Progress,
    ResponseErrorPanel,
} from '@backstage/core-components';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { IaCCoveragePieChart } from '../IaCCoveragePieChart/IaCCoveragePieChart';

/**
 * Component that displays a pie chart of dependencies IaC coverage
 * This component is meant to be used as an entity overview tab addon
 */
export const DependenciesIaCCoverageCard = () => {
    const { entity } = useEntity();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const [relatedEntities, setRelatedEntities] = useState<any[]>([]);
    const catalogApi = useApi(catalogApiRef);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const refs: string[] = [];
                entity.relations?.forEach(relation => {
                    refs.push(relation.targetRef);
                });
                const response = await catalogApi.getEntitiesByRefs({ entityRefs: refs });
                setRelatedEntities(response.items);
            } catch (e) {
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [entity, catalogApi]);

    if (loading) {
        return <Progress />;
    }

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return <IaCCoveragePieChart relatedEntities={relatedEntities} />;
}; 