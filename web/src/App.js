import React from 'react'
import {
  ApolloClient,
  NormalizedCacheObject,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  gql,
  useQuery,
} from '@apollo/client'
import Pages from './pages'
import { IS_LOGGED_IN } from './gql/query'
import { setContext } from '@apollo/client/link/context'

 // Determine API URI based on environment
 const uri =
   (typeof window !== 'undefined' && window.location.hostname === 'localhost')
     ? 'http://localhost:4000/graphql'
     : process.env.API_URI || 'https://api.ichor.by/graphql';

 console.log('Apollo API URI:', uri);
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

export default App;