import React from 'react';
import { useQuery } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';

import { GET_USER } from '../gql/query';

const GetUser = () => {
  let  { id } = useParams();

  const { loading, error, data } = useQuery(GET_USER, {variables: {id} });

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let uname = data.getUser.name;

  return (
  <div className="cats_block">
  <div className="all-post-block">
    <div className="all_post">
      <span className="uname_weight">
        {data.getUser.name} (all posts: {data.getUser.posts.length})
      </span>
    </div>
  </div>
  <ul>
    {data.getUser.posts.map(post => (
      <li key={post._id} className="mypost_li">
      <Link  to={`/users/${uname}/post/${post._id}`}>
        <h1>{post.title}</h1>
      </Link>
        <div className="css-plank-cat">
        <Link  to={`/cats/${post.category._id}`}>
          {`${post.category.catname}`}
        </Link>
          <span>{post.createdAt}</span>
          <span>{`views ${post.viewsCount}`}</span>
        </div>
        </li>
    ))}
    </ul>
  </div>
);
};

export default GetUser;
