import React, { useMemo } from 'react';

import { useQuery, gql } from '@apollo/client';
import TitleList from '../components/TitleList';
import styled from 'styled-components';
import Fpost from '../components/FirstPost';

import { GET_HOME_NOTES } from '../gql/query';
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

  const {data, loading, error} = useQuery(GET_HOME_NOTES,
    {}
  );
  const posts = useMemo(() => {
    const feeds = ['technology', 'events', 'economy', 'people', 'incidents', 'realEstate', 'design'];
    const uniquePosts = new Map();
    feeds.forEach(feed => (data?.[feed]?.posts || []).forEach(post => uniquePosts.set(post._id, post)));
    return [...uniquePosts.values()].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  }, [data]);

  if (error) return <p>error</p>
  if (loading) return <p>loading...</p>

  return (
  <>
    <PostParagraph>
      <Fpost />
      <div className="rt-lenta-post">
        <TitleList posts={posts.slice(0, 3)} />
      </div>
    </PostParagraph>
    <RequiredTagNewsSection posts={posts} />
  </>
  )};

export default Home;
