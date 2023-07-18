import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import { GET_CATS } from '../gql/query';

const CatsPage = props => {

  const { loading, error, data, fetchMore } = useQuery( GET_CATS, {
  refetchQueries: [{query: GET_CATS} ] });

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  return (
  <>
    {data.getCats.map(cats => (

        <NavLink key={cats._id} to={`/cats/${cats._id}`} style={({ isActive }) => { return { color: isActive ? "#fff" : "", }; }}><li key={cats._id}>{cats.catname}</li></NavLink>

    ))}
  </>
);
};

export default CatsPage;
