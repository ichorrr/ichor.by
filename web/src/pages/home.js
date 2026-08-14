import React, {useEffect} from 'react';

import { useQuery, gql } from '@apollo/client';
import TitleList from '../components/TitleList';
import styled from 'styled-components';
import Fpost from '../components/FirstPost';

import { GET_NOTES } from '../gql/query';
import RequiredTagNewsSection from '../components/RequiredTagNewsSection';

const PostParagraph = styled.div`
    position: relative;
    width: 100%;
    min-height: 760px;
    display: block;
    overflow: hidden;
    margin-bottom: 2rem;
`;

const Home = () => {

  const {data, loading, error} = useQuery(GET_NOTES, 
    { variables: {
      limit: 3
    } }
  );
  if (error) return <p>error</p>
  if (loading) return <p>loading...</p>

  return (
  <>
    <PostParagraph>
      <Fpost />
      <div className="rt-lenta-post">
        <TitleList posts={data.postFeed.posts} />
      </div>
    </PostParagraph>
    <RequiredTagNewsSection posts={data.postFeed.posts} />
  </>
  )};

export default Home;
