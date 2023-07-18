import React from 'react';
import { Link } from 'react-router-dom';

import { useQuery, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import TitleList from '../components/TitleList';
import styled from 'styled-components';
import Fpost from '../components/FirstPost';

import { GET_NOTES } from '../gql/query';

const PostParagraph = styled.div`
    width: 100%;
    display: block;
`;

const Home = () => {
  const {data, loading, error, fetchMore} = useQuery(GET_NOTES);

  if (loading) return <p>loading...</p>

  return (
  <div>
    <PostParagraph>
      <Fpost />
      <div className="rt-lenta-post">
        <TitleList posts={data.postFeed.posts} />
      </div>
    </PostParagraph>
  </div>
  )};

export default Home;
