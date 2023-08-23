<<<<<<< HEAD
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Canvas, useLoader } from "react-three-fiber";
import Model from './components/Model'
=======
import React from 'react';

>>>>>>> 492e03c1218cfdae737f7c86330ea4f704759cf4
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
    <>
    
   <ApolloProvider client={client}>
<<<<<<< HEAD
      <Canvas>
        <Model />
      </Canvas>
=======

>>>>>>> 492e03c1218cfdae737f7c86330ea4f704759cf4
     <Pages />
   </ApolloProvider>
   </>
 );
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 492e03c1218cfdae737f7c86330ea4f704759cf4
