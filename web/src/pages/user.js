import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { GET_NOTES, GET_POST, GET_USER } from '../gql/query';
import UserPosts from '../components/UserPosts';

const GetUser = () => {
  let  { id } = useParams();

  const { loading, error, data } = useQuery(GET_USER, {variables: {id},
    refetchQueries: [{query: GET_NOTES, GET_POST }] });

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let userposts = data.getUser;

  return (
    <>
    <UserPosts posts={userposts} />
  </>
);
};

export default GetUser;
