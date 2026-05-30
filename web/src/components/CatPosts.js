import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Error from './Error';
import LikeDislike from './LikeDislike';

const CatPosts = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    document.title = `${posts.catname} Category > ichor.by`;
  }, [posts.catname]);

  const isAuthenticated = !!localStorage.getItem('token');

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (posts.posts || [])
      .filter(post => {
        if (!query) return true;
        const text = [post.title, post.author?.name, ...(post.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return text.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const aRating = (a.likesCount || 0) - (a.dislikesCount || 0);
          const bRating = (b.likesCount || 0) - (b.dislikesCount || 0);
          return bRating - aRating;
        }
        if (sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (sortBy === 'comments') {
          return (b.commentCount || 0) - (a.commentCount || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [posts.posts, searchQuery, sortBy]);

  if (!posts || !posts.posts) return <p><Error text="Категория пуста или не найдена." /></p>;

  return (
    <div className="cats_block">
      <div className="all-post-block">
        <div className="all_post">
          <span className="uname_weight">{posts.catname}</span> Всего {posts.posts.length} записей
        </div>
      </div>
      <div className="search-sort-controls">
        <input
          type="text"
          placeholder="Поиск по заметкам категории"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">По дате</option>
          <option value="rating">По рейтингу</option>
          <option value="views">По просмотрам</option>
          <option value="comments">По комментариям</option>
        </select>
      </div>
      <div className="cat-post-li">
        <ul>
          {filteredPosts.map(post => (
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
                {/* If post belongs to admin-only categories (Новости/Статьи) hide author info */}
                {(() => {
                  const adminCatIds = ['6251ef28413373118838bbdd', '6251f1532f7a51343c8ed7df'];
                  const isAdminCat = post.category && adminCatIds.includes(post.category._id);
                  return (
                    <>
                      <div className="css-plank-cat f hdpltkt" />
                      <div className="css-plank-cat">
                        {isAdminCat ? null : (post.author && <Link to={`/users/${post.author._id}`}>{post.author.name}</Link>)}
                        <span>{format(new Date(post.createdAt), 'dd LLL yyyy')}</span>
                        <span>👁️ {post.viewsCount}</span>
                        <span>{`Комментариев ${post.commentCount || 0}`}</span>
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
                    </>
                  );
                })()}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {filteredPosts.length === 0 && <p>Ничего не найдено.</p>}
    </div>
  );
};

export default CatPosts;
