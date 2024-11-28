import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_POST } from '../gql/query';

function IsAdmin() {

    const {data, loading, error } = useQuery(GET_MY_POST);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;

  const isAdmin = data.me.isAdmin;

  return {isAdmin};
}

export default IsAdmin;