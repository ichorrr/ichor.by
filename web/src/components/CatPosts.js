import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Error from './Error';
import LikeDislike from './LikeDislike';
import useWindowSize from './UseWindowSize.js';

const REQUIRED_TAGS = [
  { name: 'Технологии', icon: '💻' },
  { name: 'События', icon: '📅' },
  { name: 'Экономика', icon: '💰' },
  { name: 'Люди', icon: '👥' },
  { name: 'Происшествия', icon: '⚠️' },
  { name: 'Недвижимость', icon: '🏠' },
  { name: 'Дизайн', icon: '🎨' },
];

const CatPosts = ({ posts }) => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${posts.catname} Category > ichor.by`;
  }, [posts.catname]);

  const isAuthenticated = !!localStorage.getItem('token');
  const isDesktopLayout = typeof window !== 'undefined' ? windowSize.width > 960 : true;
  const isNewsCategory = Boolean(posts?.catname && /новости/i.test(posts.catname));
  const isTagPage = Boolean(posts?.catname && /^тег/i.test(posts.catname));
  const shouldShowRequiredTags = isNewsCategory || isTagPage;

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

  const handleTagSelect = (tagName) => {
    setIsTagMenuOpen(false);
    navigate(`/tag/${encodeURIComponent(tagName.trim().replace(/^#/, ''))}`);
  };

  const renderPostList = () => (
    <div className="cat-post-li">
      <ul>
        {filteredPosts.map(post => (
          <li key={post._id} className="mypost_li li-post-flex">
            <div className="iconPost">
              {post.iconPost ? (
                <img src={post.iconPost} alt={post.title} />
              ) : (
                <img src="https://api.ichor.by/uploads/no_avatar.png" className="no-avatar" alt="no avatar" />
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
                      <LikeDislike
                        targetId={post._id}
                        type="post"
                        initialLikes={post.likesCount || 0}
                        initialDislikes={post.dislikesCount || 0}
                        isAuthenticated={isAuthenticated}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="cats_block">
      {shouldShowRequiredTags ? (
        <div className="category-page-shell">
          {isDesktopLayout ? (
            <aside className="required-tags-sidebar">
              <div className="required-tags-sidebar__title">Обязательные теги</div>
              <ul className="required-tags-list">
                {REQUIRED_TAGS.map(tag => (
                  <li key={tag.name}>
                    <button type="button" className="required-tags-link" onClick={() => handleTagSelect(tag.name)}>
                      <span className="required-tags-link__icon" aria-hidden="true">{tag.icon}</span>
                      <span>{tag.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <div className="required-tags-mobile">
              <button type="button" className="required-tags-toggle" onClick={() => setIsTagMenuOpen(prev => !prev)}>
                {isTagMenuOpen ? 'Скрыть теги' : 'Показать теги'}
              </button>
              {isTagMenuOpen && (
                <ul className="required-tags-list required-tags-list--mobile">
                  {REQUIRED_TAGS.map(tag => (
                    <li key={tag.name}>
                      <button type="button" className="required-tags-link" onClick={() => handleTagSelect(tag.name)}>
                        <span className="required-tags-link__icon" aria-hidden="true">{tag.icon}</span>
                        <span>{tag.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="category-content">
            <div className="all-post-block">
              <div className={posts.catname === 'Новости' ? 'all_post news-cat' : 'all_post'}>
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
            {renderPostList()}
            {filteredPosts.length === 0 && <p>Ничего не найдено.</p>}
          </div>
        </div>
      ) : (
        <>
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
          {renderPostList()}
          {filteredPosts.length === 0 && <p>Ничего не найдено.</p>}
        </>
      )}
    </div>
  );
};

export default CatPosts;
