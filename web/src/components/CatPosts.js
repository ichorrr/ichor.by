import React, {useEffect} from 'react';
import { useQuery, gql } from '@apollo/client';

import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { GET_NOTES } from '../gql/query';
import Error from './Error';

const CatPosts = ({posts}) => {

  useEffect(() => {
    document.title = `${posts.catname} Category > ichor.by`;;
  });

  let uname = posts.id;

  const {data, loading, error, fetchMore } = useQuery(GET_NOTES, 
    { variables: {
      limit: 10,
      qualifier: posts._id
    }, }
  );
  if (loading) return <p>Loading...</p>;
  if (error) return <p><Error text="The category is empty. You must public first post." /></p>;

  return (
    <div className="cats_block">
    <div className="all-post-block">
      <div className="all_post">
        <span className="uname_weight">{uname}</span> total posts: {posts.posts.length}
      </div>
    </div>
    <div className="cat-post-li">
    <ul>
      { 
      data.postFeed.posts.map(post => (
        
          <li key={post._id} className='mypost_li li-post-flex'>
            <div className="iconPost">
              {post.iconPost ? <img src={post.iconPost} /> : <img src='https://api.ichor.by/uploads/no_avatar.png' className='no-avatar'/> }
            </div>
            <div className='post-cont'>
              <Link to={`/posts/${post._id}`}>
                <h1>{post.title}</h1>
              </Link>
              <div className="css-plank-cat">
                <Link  to={`/users/${post.author._id}`}>
                  {`${post.author.name}`}
                </Link>
                <span>{format(new Date(post.createdAt), 'dd LLL yyyy')}</span>
                <span>{`views ${post.viewsCount}`}</span>
              </div>
            </div>
          </li>
      )) }
    </ul>
    </div>
    {data.postFeed.hasNextPage && (
    <div className='clickMore' onClick={() =>
            fetchMore({
              variables: {
                cursor: data.postFeed.cursor
              },
              updateQuery: (previousResult, { fetchMoreResult}) => {
                
                return { postFeed: {
                  cursor: fetchMoreResult.postFeed.cursor,
                  hasNextPage: fetchMoreResult.postFeed.hasNextPage,
                  // combine the new results and the old
                  posts: [
                    ...previousResult.postFeed.posts,
                    ...fetchMoreResult.postFeed.posts
                  ],
                  __typename: 'postFeed'
                } };
              }
            })
}>more</div>)}
    </div>
  );
};

export default CatPosts;
