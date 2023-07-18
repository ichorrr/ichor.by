import React, {useEffect, useState} from 'react';
import { useQuery, gql } from '@apollo/client';
import ArtPage from '../components/Ifelse';
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const UniBlock = ({ post }) => {

  const { loading, error, data } = useQuery(IS_LOGGED_IN);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return <ArtPage id={post}/>

  };

export default UniBlock;
