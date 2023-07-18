import React, { lazy, Suspense } from 'react';
import loadable from "@loadable/component";
import { Link } from 'react-router-dom';
import Post from '../components/Post';
import { useQuery, gql } from '@apollo/client';
import { GET_NOTES } from '../gql/query';
import styled from 'styled-components';



const BlockArt = styled.div`

  display: block;

  padding: 0.5em 0.8em;
  margin: 0.5em 1em 0.5em 0;
  font: bold 1.2em Arial, sans-serif;

  a {
    color: #d60000;
    text-decoration: none;
  }

  :hover {
    cursor: pointer;
    background: #e3e3e3;
  }
`;

const ArtPost = props => {

  const { loading, error, data, fetchMore } = useQuery(GET_NOTES);
  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  return (
    <div>
    <BlockArt>
    <Link to={`/arts/${data.postFeed.posts[1]._id}.html`} >smdfbskld</Link>
    </BlockArt>

    < a href="https://github.com/javascripteverywhere/web/issues/20">sjfsd</a>
    </div>
  )
};

export default ArtPost;
