import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PostBlock = styled.div`
  padding-bottom: 3em;
  display: block;
`;

const TitleList = ({ posts }) => {

  return (
    <>
      {' '}
      {posts.map(post => (
        <PostBlock key={post._id}>
          <Link to={`posts/${post._id}`}>{post.title}</Link>
          {format(new Date(post.createdAt), 'dd LLL yyyy')} <span className="css-author"> {post.author.name}</span>
        </PostBlock>
      ))}
    </>
  );
};

export default TitleList;
