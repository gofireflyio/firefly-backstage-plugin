// import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { fireflyPlugin } from '../src';

createDevApp()
  .registerPlugin(fireflyPlugin)
  // .addPage({
  //   element: <FireflyPage />,
  //   title: 'Firefly Page',
  //   path: '/firefly',
  // }) 
  .render();