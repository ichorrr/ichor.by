import React from 'react';
import styled from 'styled-components';
import PostList from './PostList';
import { Link } from 'react-router-dom';

const PostBorder = styled.div`
  display: block;
`;

const PostBlock = styled.div`
  padding-bottom: 4em;
  display: block;
`;

const PostFeed = ({ posts }) => {

  let items = [posts]
  let litem = items.length;

  return (
    <PostBorder>
      {' '}
      {posts.map(post => (
        <PostBlock key={post._id}>
          <PostList post={post} />
          <Link to={`posts/${post._id}`}>Permalink</Link>
        </PostBlock>
      ))}
    </PostBorder>
  );
};

export default PostFeed;
