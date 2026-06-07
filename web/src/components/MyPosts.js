import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import LikeDislike from './LikeDislike';

const MyPosts = ({ posts, userName }) => {
  useEffect(() => {
    document.title = 'My Posts > ichor.by';
  }, []);

  const isAuthenticated = !!localStorage.getItem('token');

  const getExternalSource = (post) => {
    const sourceUrl = post.externalSource && typeof post.externalSource === 'string'
      ? post.externalSource
      : post.externalSource?.url;
    const sourceIcon = post.externalSource && typeof post.externalSource === 'object'
      ? post.externalSource.icon
      : null;
    const sourceHref = sourceUrl ? (sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`) : null;
    return { sourceUrl, sourceIcon, sourceHref };
  };

  return (
    <div className="cats_block">
      <div className="all-post-block">
        <div className="all_post">
          Всего {posts.length} записей <span className="uname_weight">{userName}</span>
        </div>
      </div>
      <div className="cat-post-li">
        <ul>
          {posts.map(post => (
            <li key={post._id} className="mypost_li li-post-flex">
              <div className="iconPost">
                {post.iconPost ? (
                  <img src={post.iconPost} />
                ) : (
                  <img src="https://api.ichor.by/uploads/no_avatar.png" className="no-avatar" />
                )}
              </div>
              <div className="post-cont">
                <Link to={`/posts/${post._id}`}>
                  <h1>{post.title}</h1>
                </Link>
                {(() => {
                  const { sourceHref, sourceUrl, sourceIcon } = getExternalSource(post);
                  if (!sourceHref) return null;
                  return (
                    <div className="list-external-source">
                      {sourceIcon ? (
                        sourceIcon.startsWith('http') ? (
                          <img src={sourceIcon} alt="source icon" />
                        ) : (
                          <span className="external-source-label">{sourceIcon}</span>
                        )
                      ) : null}
                      <a href={sourceHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{sourceUrl}</a>
                    </div>
                  );
                })()}
                <div className="css-plank-cat">
                  <Link to={`/cats/${post.category._id}`}>{post.category.catname}</Link>
                  <span>{format(new Date(post.createdAt), 'dd LLL yyyy')}</span>
                  <span>👁️ {post.viewsCount}</span>
                  <span className='icomments'> {post.commentCount || 0}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                    <LikeDislike
                      targetId={post._id}
                      type="post"
                      initialLikes={post.likesCount || 0}
                      initialDislikes={post.dislikesCount || 0}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
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
