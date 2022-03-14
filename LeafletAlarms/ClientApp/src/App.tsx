import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import { Home } from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import FetchMarkers   from './components/FetchMarkers';
import './custom.css'


export default () => (
    <Layout>
      <Route exact path='/' component={Home} />
      <Route path='/counter' component={Counter} />
      <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
      <Route path='/fetch-markers/:box?' component={FetchMarkers} />
    </Layout>
);
