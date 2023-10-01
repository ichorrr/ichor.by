import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { format } from 'date-fns';
import { GET_MY_POST } from '../gql/query';

const PostParagraph = styled.div`
    background-color: #dae6f7;
    width: 100%;
    display: block;
    margin-bottom: 1em;
`;

const PostBlock = styled.div`
  padding-bottom: 4em;
  display: block;
`;

const MyPosts = props => {

  useEffect(() => {
    document.title = 'My Posts - ICHOR.BY';
  });

  const { loading, error, data, fetchMore } = useQuery( GET_MY_POST,
  {refetchQueries: [{query: GET_MY_POST }]} );

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let uname = data.me.name;

  return (
    <div className="myposts-li-block">
    <div className="all-post-block">
      <div className="all_post">
        <span className="uname_weight">{uname}</span> (all posts: {data.me.posts.length})
      </div>
    </div>
    <div className="cat-post-li">
    <ul>
      {data.me.posts.map(post => (
          <li key={post._id}>
            <Link to={`/posts/${post._id}`}>
              <h1>{post.title}</h1>
            </Link>
          <div className="css-plank-cat">
          <Link  to={`/cats/${post.category._id}`}>
            {`${post.category.catname}`}
          </Link>
            <span>{format(new Date(post.createdAt), 'dd LLLL yyyy  HH:mm')}</span>
            <span>{`views ${post.viewsCount}`}</span>
          </div>
          </li>
      ))}
    </ul>
    </div>
    </div>
  );
};

export default MyPosts;
