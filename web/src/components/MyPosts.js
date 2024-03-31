import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';


const MyPosts = ({posts}) => {

  useEffect(() => {
    document.title = 'My Posts - ICHOR.BY';
  });

  let uname = posts.name;


  return (
    <div className="cats_block">
    <div className="all-post-block">
      <div className="all_post">
        <span className="uname_weight">{uname}</span> (all posts: {posts.length})
      </div>
    </div>
    <div className="cat-post-li">
    <ul>
      {

      posts.map(post => (
        
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
      ))}
    </ul>
    </div>
    </div>
  );
};

export default MyPosts;
