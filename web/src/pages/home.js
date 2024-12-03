import React, {useEffect} from 'react';

import { useQuery, gql } from '@apollo/client';
import TitleList from '../components/TitleList';
import styled from 'styled-components';
import Fpost from '../components/FirstPost';

import { GET_NOTES } from '../gql/query';

const PostParagraph = styled.div`
    width: 100%;
    display: block;
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
