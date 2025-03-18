import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Link,
} from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { fireflyApiRef, FireflyAsset } from '../api/client';

export const EntityFireflySummary = () => {
  const { entity } = useEntity();
  const fireflyApi = useApi(fireflyApiRef);
  const [assets, setAssets] = useState<FireflyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Get the tag key-value from the entity's metadata
        const tagKey = entity.metadata.annotations?.['firefly.ai/tag-key'];
        const tagValue = entity.metadata.annotations?.['firefly.ai/tag-value'];

        if (!tagKey || !tagValue) {
          setLoading(false);
          return;
        }

        const data = await fireflyApi.getAssets({
          tags: { [tagKey]: tagValue },
        });
        setAssets(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [entity, fireflyApi]);

  if (loading) {
    return null;
  }

  if (error || assets.length === 0) {
    return null;
  }

  // Calculate summary statistics
  const totalAssets = assets.length;
  const iacStatusCounts = assets.reduce((acc, asset) => {
    acc[asset.iacStatus] = (acc[asset.iacStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader title="Firefly Summary" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Total Assets: {totalAssets}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">IaC Status:</Typography>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(iacStatusCounts).map(([status, count]) => (
                <Chip
                  key={status}
                  label={`${status}: ${count}`}
                  color={status === 'managed' ? 'primary' : 'secondary'}
                />
              ))}
            </div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Quick Links:</Typography>
            <div style={{ display: 'flex', gap: '16px' }}>
              {assets.map(asset => (
                <div key={asset.identifier}>
                  <Link href={asset.cloudLink} target="_blank" rel="noopener noreferrer">
                    Cloud
                  </Link>
                  {' | '}
                  <Link href={asset.codeLink} target="_blank" rel="noopener noreferrer">
                    Code
                  </Link>
                  {' | '}
                  <Link href={asset.fireflyLink} target="_blank" rel="noopener noreferrer">
                    Firefly
                  </Link>
                </div>
              ))}
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 