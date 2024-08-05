import React, {useEffect} from 'react';
import { useQuery, gql } from '@apollo/client';

import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { GET_NOTES } from '../gql/query';

const CatPosts = ({posts}) => {

  useEffect(() => {
    document.title = 'My Posts - ICHOR.BY';
  });

  let uname = posts.id;

  const {data, loading, error, fetchMore } = useQuery(GET_NOTES, 
    { variables: {
      limit: 10,
      qualifier: posts._id
    }, }
  );
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

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
              <img src={post.iconPost} />
            </div>
            <div className='post-cont'>
              <Link to={`/posts/${post._id}`}>
                <h1>{post.title}</h1>
              </Link>
              <div className="css-plank-cat">
                <Link  to={`/cats/${post.category._id}`}>
                  {`${post.category.catname}`}
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
