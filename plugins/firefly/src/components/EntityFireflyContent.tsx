import React, { useEffect, useState } from 'react';
import {
  Content,
  ContentHeader,
  Header,
  Table,
  TableColumn,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { fireflyApiRef, FireflyAsset } from '../api/client';

export const EntityFireflyContent = () => {
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
    return <Progress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (assets.length === 0) {
    return (
      <Content>
        <ContentHeader title="Firefly Assets" />
        <div>No Firefly assets found for this entity. </div>
      </Content>
    );
  }

  return (
    <Content>
      <ContentHeader title="Firefly Assets" />
      <Table>
        <TableHead>
          <TableRow>
            <TableColumn>Name</TableColumn>
            <TableColumn>Identifier</TableColumn>
            <TableColumn>Cloud Account</TableColumn>
            <TableColumn>IaC Status</TableColumn>
            <TableColumn>Links</TableColumn>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map(asset => (
            <TableRow key={asset.identifier}>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.identifier}</TableCell>
              <TableCell>{asset.cloudAccountIdentifier}</TableCell>
              <TableCell>{asset.iacStatus}</TableCell>
              <TableCell>
                <a href={asset.cloudLink} target="_blank" rel="noopener noreferrer">
                  Cloud
                </a>
                {' | '}
                <a href={asset.codeLink} target="_blank" rel="noopener noreferrer">
                  Code
                </a>
                {' | '}
                <a href={asset.fireflyLink} target="_blank" rel="noopener noreferrer">
                  Firefly
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Content>
  );
}; 