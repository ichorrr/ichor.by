import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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
  const imageUrl = post.imageUrl || post.iconPost || '';
  const videoUrl = post.scriptUrl ? post.imageUrl2 || post.imageUrl3 || post.imageUrl : '';
  return imageUrl || videoUrl || '';
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
                        <img src={mediaSrc} alt={post.title} loading="lazy" decoding="async" />
                      </div>
                    ) : null}
                    <div className="required-tag-news-card__content">
                      <Link to={`/posts/${post._id}`} className="required-tag-news-card__title">
                        <h4>{post.title}</h4>
                      </Link>
                      <div className="required-tag-news-meta">
                        <span>{format(new Date(post.createdAt), 'dd LLL yyyy')}</span>
                        {externalSource ? (
                          <a href={externalSource.href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            {externalSource.url}
                          </a>
                        ) : null}
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
