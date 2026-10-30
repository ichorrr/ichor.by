import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getThumbnailUrl, isVideoUrl } from '../utils/media';

const REQUIRED_TAGS = [
  { name: 'Технологии', icon: '💻' },
  { name: 'События', icon: '📅' },
  { name: 'Экономика', icon: '💰' },
  { name: 'Люди', icon: '👥' },
  { name: 'Происшествия', icon: '⚠️' },
  { name: 'Недвижимость', icon: '🏠' },
  { name: 'Дизайн', icon: '🎨' },
];

const normalizeTag = (value) => `${value || ''}`.trim().replace(/^#/, '').toLowerCase();

const getMediaSrc = (post) => {
  return [post.imageUrl, post.imageUrl2, post.imageUrl3, post.imageUrl4, post.iconPost]
    .filter(Boolean)
    .map(value => value.split('|')[0])[0] || '';
};

const getExternalSource = (post) => {
  const sourceUrl = post.externalSource && typeof post.externalSource === 'string'
    ? post.externalSource
    : post.externalSource?.url;
  const sourceHref = sourceUrl ? (sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`) : null;
  return sourceHref ? { url: sourceUrl, href: sourceHref } : null;
};

const RequiredTagNewsSection = ({ posts }) => {
  const allPosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="required-tag-news-section">
      {REQUIRED_TAGS.map(tag => {
        const filteredPosts = allPosts
          .filter(post => (post.tags || []).some(candidate => normalizeTag(candidate) === normalizeTag(tag.name)))
          .slice(0, 7);

        if (filteredPosts.length === 0) return null;

        return (
          <section key={tag.name} className="required-tag-news-block">
            <div className="required-tag-news-block__header">
              <h3>{tag.name}</h3>
              <span>{tag.icon}</span>
            </div>
            <div className="required-tag-news-list">
              {filteredPosts.map(post => {
                const mediaSrc = getMediaSrc(post);
                const externalSource = getExternalSource(post);
                return (
                  <article key={post._id} className="required-tag-news-card">
                    {mediaSrc ? (
                      <div className="required-tag-news-card__media">
                        {isVideoUrl(mediaSrc)
                          ? <video src={mediaSrc} poster={getThumbnailUrl(mediaSrc)} aria-label={post.title} preload="metadata" />
                          : <img src={getThumbnailUrl(mediaSrc) || mediaSrc} alt={post.title} loading="lazy" decoding="async" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = mediaSrc; }} />}
                      </div>
                    ) : null}
                    <div className="required-tag-news-card__content">
                      <Link to={`/posts/${post._id}`} className="required-tag-news-card__title">
                        <h4>{post.title}</h4>
                      </Link>
                      <div className="required-tag-news-meta">
                        <div className="required-tag-news-meta__source">
                          <span>{format(new Date(post.createdAt), 'dd LLL yyyy')}</span>
                          {externalSource ? (
                            <a href={externalSource.href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              {externalSource.url}
                            </a>
                          ) : null}
                        </div>
                        <div className="required-tag-news-stats" aria-label="Статистика статьи">
                          <span className="required-tag-news-stats__item" aria-label={`Просмотров: ${post.viewsCount || 0}`} title="Просмотры">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {post.viewsCount || 0}
                          </span>
                          <span className="required-tag-news-stats__item" aria-label={`Комментариев: ${post.commentCount || 0}`} title="Комментарии">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2v-6.5a7.5 7.5 0 1 1 17-3Z" />
                              <path d="M8 11h.01M12 11h.01M16 11h.01" />
                            </svg>
                            {post.commentCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default RequiredTagNewsSection;
