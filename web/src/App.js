import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  NormalizedCacheObject,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  gql,
  useQuery,
} from '@apollo/client';
 import Pages from './pages';
import { IS_LOGGED_IN } from './gql/query';


 import { setContext } from '@apollo/client/link/context';
 const uri = process.env.API_URI;
 const httpLink = createHttpLink({ uri });
 const cache = new InMemoryCache();

 cache.writeQuery({
   query: IS_LOGGED_IN,
   data: {
     isLoggedIn: !!localStorage.getItem("token"),
   },
 });

 const authLink = setContext((_, { headers }) => {
   return {
     headers: {
       ...headers,
       authorization: localStorage.getItem('token') || ''
     }
   };
 });
 const client = new ApolloClient({
   uri,
   link: authLink.concat(httpLink),
   cache,
   resolvers: {},
   connectToDevTools: true
 });


 const App = () => {
   return(
   <ApolloProvider client={client}>
     <Pages />
   </ApolloProvider>
 );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
