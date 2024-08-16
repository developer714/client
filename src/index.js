import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import TokenPairsComponent from './component/TokenParisComponent';

const client = new ApolloClient({
  uri: 'http://216.146.25.42:4000/graphql', // Replace with your GraphQL server URI
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <TokenPairsComponent />
  </ApolloProvider>,
  document.getElementById('root')
);