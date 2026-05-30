import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CAT } from '../gql/query';
import CatPosts from '../components/CatPosts';

const CatPage = () => {
  const { id } = useParams();

  const { loading, error, data } = useQuery(GET_CAT, { variables: { id } });
  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  const catposts = data.getCat;

  return <CatPosts posts={catposts} />;
};

export default CatPage;
