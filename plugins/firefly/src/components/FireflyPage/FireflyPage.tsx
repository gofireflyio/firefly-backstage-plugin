import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
    Header,
    Page,
    Content,
    Progress,
    ResponseErrorPanel,
    InfoCard,
} from '@backstage/core-components';
import { IaCCoveragePieChart } from '../IaCCoveragePieChart/IaCCoveragePieChart';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { useStyles } from './FireflyPage.style';
import { numberWithCommas } from '../common';
import { TopFiveComponents } from '../TopFiveComponentsWith/TopFiveComponents';

export const FireflyPage = () => {
    const catalogApi = useApi(catalogApiRef);
    const [fireflyResourceEntities, setFireflyResourceEntities] = useState<Entity[]>([]);
    const [fireflySystemEntities, setFireflySystemEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const classes = useStyles();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let response = await catalogApi.getEntities({
                    filter: {
                        kind: 'Resource',
                        "metadata.annotations.firefly.ai/managed-by-firefly": "true"
                    }
                });
                setFireflyResourceEntities(response.items);

                response = await catalogApi.getEntities({
                    filter: {
                        kind: 'System',
                        "metadata.annotations.firefly.ai/managed-by-firefly": "true"
                    }
                });
                setFireflySystemEntities(response.items);
            } catch (e) {
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [catalogApi]);

    if (loading) {
        return <Progress />;
    }

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return (
        <Page themeId="tool">
            <Header
                title="Firefly"
                subtitle="Resources visibility and IaC coverage metrics"
            />
            <Content>
                <Grid container direction="column" spacing={1} >
                    <Grid container direction="row" spacing={1} columns={12}>
                        <Grid size={6}>
                            <InfoCard title="Total Resources">
                                <span className={`${classes.gradientText} ${classes.totalText}`}>
                                    {numberWithCommas(fireflyResourceEntities.length.toString())}
                                </span>
                            </InfoCard>
                        </Grid>
                        <Grid size={6}>
                            <InfoCard title="Total Systems">
                                <span className={`${classes.gradientText} ${classes.totalText}`}>
                                    {numberWithCommas(fireflySystemEntities.length.toString())}
                                </span>
                            </InfoCard>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" columns={12}>
                        <Grid size={6}>
                            <IaCCoveragePieChart relatedEntities={fireflyResourceEntities} />
                        </Grid>
                        <Grid size={6}> 
                            <TopFiveComponents type="resources" entities={fireflyResourceEntities} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" columns={12}>
                        <Grid size={6}>
                            <TopFiveComponents type="unmanaged" entities={fireflyResourceEntities} />
                        </Grid>
                        <Grid size={6}> 
                            <TopFiveComponents type="drifted" entities={fireflyResourceEntities} />
                        </Grid>
                    </Grid>
                </Grid>
            </Content>
        </Page>
    );
};
