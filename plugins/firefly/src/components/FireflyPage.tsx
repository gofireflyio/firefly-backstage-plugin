import React, { useState } from 'react';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  TabbedLayout,
  Tabs,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { fireflyApiRef } from '../api/client';
import { FireflyAssetsTable } from './FireflyAssetsTable';
import { FireflyAggregationsTable } from './FireflyAggregationsTable';

export const FireflyPage = () => {
  const fireflyApi = useApi(fireflyApiRef);
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Page themeId="tool">
      <Header title="Firefly Assets" />
      <Content>
        <ContentHeader title="Firefly Inventory" />
        <TabbedLayout>
          <Tabs
            selectedIndex={selectedTab}
            onChange={index => setSelectedTab(index)}
            tabs={[
              {
                label: 'Assets',
                content: <FireflyAssetsTable />,
              },
              {
                label: 'Aggregations',
                content: <FireflyAggregationsTable />,
              },
            ]}
          />
        </TabbedLayout>
      </Content>
    </Page>
  );
}; 