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

const TitleList = ({ posts }) => {

  return (
    <PostBorder>
      {' '}
      {posts.map(post => (
        <PostBlock key={post._id}>
          <Link to={`posts/${post._id}`}>{post.title}</Link>
          {post.createdAt} | <span className="css-author">{post.author.name}</span>
        </PostBlock>
      ))}
    </PostBorder>
  );
};

export default TitleList;
