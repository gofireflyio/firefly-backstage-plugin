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
import { fireflyApiRef, FireflyAsset } from '../api/client';
import { Link } from '@backstage/core-components';

export const FireflyAssetsTable = () => {
  const fireflyApi = useApi(fireflyApiRef);
  const [assets, setAssets] = useState<FireflyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await fireflyApi.getAssets();
        setAssets(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [fireflyApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Content>
      <Header title="Firefly Assets" />
      <Table>
        <TableHead>
          <TableRow>
            <TableColumn>Name</TableColumn>
            <TableColumn>Identifier</TableColumn>
            <TableColumn>Cloud Account</TableColumn>
            <TableColumn>IaC Status</TableColumn>
            <TableColumn>Links</TableColumn>
            <TableColumn>Tags</TableColumn>
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
                <Link to={asset.cloudLink}>Cloud</Link>
                {' | '}
                <Link to={asset.codeLink}>Code</Link>
                {' | '}
                <Link to={asset.fireflyLink}>Firefly</Link>
              </TableCell>
              <TableCell>
                {Object.entries(asset.tags).map(([key, value]) => (
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