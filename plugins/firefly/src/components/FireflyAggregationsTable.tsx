import React, { useEffect, useState } from 'react';
import {
  Table,
  TableColumn,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Header,
  Content,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { fireflyApiRef, FireflyAggregation } from '../api/client';

export const FireflyAggregationsTable = () => {
  const fireflyApi = useApi(fireflyApiRef);
  const [aggregations, setAggregations] = useState<FireflyAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetchAggregations = async () => {
      try {
        const data = await fireflyApi.getAggregations();
        setAggregations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregations();
  }, [fireflyApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Content>
      <Header title="Firefly Aggregations" />
      <Table>
        <TableHead>
          <TableRow>
            <TableColumn>Type</TableColumn>
            <TableColumn>Count</TableColumn>
            <TableColumn>Details</TableColumn>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregations.map(aggregation => (
            <TableRow key={aggregation.type}>
              <TableCell>{aggregation.type}</TableCell>
              <TableCell>{aggregation.count}</TableCell>
              <TableCell>
                {Object.entries(aggregation.details).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Content>
  );
}; 