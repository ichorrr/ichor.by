import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { GET_NOTES, GET_POST, GET_CAT } from '../gql/query';
import CatPosts from '../components/CatPosts';

const CatPage = () => {

  let  { id } = useParams();

  const { loading, error, data, fetchMore } = useQuery(GET_CAT, {variables: {id},
  refetchQueries: [{query: GET_NOTES, GET_POST }]});
  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let catposts = data.getCat;

  return (
  <>
    <CatPosts posts={catposts} />
  </>
);
};

export default CatPage;
