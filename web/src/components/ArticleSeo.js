import React, { useEffect } from 'react';

const SITE_ORIGIN = 'https://ichor.by';
const DEFAULT_TITLE = 'ICHOR.BY - мировые новости, высокие технологии, ИТ, научные прорывы, дизайн, архитектура, искусственный интеллект, недвижимость, экономика, мировые события.';
const DEFAULT_DESCRIPTION = 'ICHOR.BY — мировые новости, технологии, наука, дизайн, архитектура, экономика и события.';

const getDescription = post => {
  const text = [post.body, post.body2, post.body3, post.body4]
    .filter(Boolean)
    .join(' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#~|-]/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return `${post.title} — читать на ICHOR.BY.`;
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
};

const getImageUrl = post => {
  const image = [post.iconPost, post.imageUrl, post.imageUrl2, post.imageUrl3, post.imageUrl4]
    .filter(Boolean)
    .map(value => String(value).split('|')[0].trim())
    .find(Boolean);
  if (!image) return '';

  try {
    const url = new URL(image, SITE_ORIGIN);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (error) {
    return '';
  }
};

const setMeta = (attribute, name, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const ArticleSeo = ({ post }) => {
  useEffect(() => {
    const title = `${post.title} | ICHOR.BY`;
    const description = getDescription(post);
    const canonical = `${SITE_ORIGIN}/posts/${post._id}`;
    const image = getImageUrl(post);

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:site_name', 'ICHOR.BY');
    setMeta('property', 'og:locale', 'ru_RU');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const publishedTime = post.createdAt ? new Date(post.createdAt) : null;
    const modifiedTime = post.updatedAt ? new Date(post.updatedAt) : null;
    if (publishedTime && !Number.isNaN(publishedTime.getTime())) {
      setMeta('property', 'article:published_time', publishedTime.toISOString());
    }
    if (modifiedTime && !Number.isNaN(modifiedTime.getTime())) {
      setMeta('property', 'article:modified_time', modifiedTime.toISOString());
    }

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('name', 'description', DEFAULT_DESCRIPTION);
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head.querySelectorAll('meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"]')
        .forEach(element => element.remove());
    };
  }, [post]);

  return null;
};

export default ArticleSeo;