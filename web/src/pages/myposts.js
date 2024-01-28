import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { GET_MY_POST } from '../gql/query';

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
    <div className="cats_block">
    <div className="all-post-block">
      <div className="all_post">
        <span className="uname_weight">{uname}</span> (all posts: {data.me.posts.length})
      </div>
    </div>
    <div className="cat-post-li">
    <ul>
      {data.me.posts.map(post => (
        
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
                <span>{format(new Date(post.createdAt), 'dd LLLL yyyy  HH:mm')}</span>
                <span>{`views ${post.viewsCount}`}</span>
              </div>
            </div>
          </li>
      ))}
    </ul>
    </div>
    </div>
  );
};

export default MyPosts;
