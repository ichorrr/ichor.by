const SITE_ORIGIN = 'https://ichor.by';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const getPlainText = value => String(value || '')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]*>/g, ' ')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/[`*_>#~|-]/g, ' ')
  .replace(/\s+([,.;!?])/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();

const getDescription = post => {
  const text = getPlainText([post.body, post.body2, post.body3, post.body4].filter(Boolean).join(' '));
  if (!text) return `${post.title} — читать на ICHOR.BY.`;
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trimEnd()}…`;
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

const metaTag = (attribute, name, content) =>
  `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}">`;

export const renderArticleSeoHtml = (html, post) => {
  const title = `${post.title} | ICHOR.BY`;
  const description = getDescription(post);
  const canonical = `${SITE_ORIGIN}/posts/${post._id}`;
  const image = getImageUrl(post);
  const tags = [
    metaTag('property', 'og:type', 'article'),
    metaTag('property', 'og:site_name', 'ICHOR.BY'),
    metaTag('property', 'og:locale', 'ru_RU'),
    metaTag('property', 'og:title', title),
    metaTag('property', 'og:description', description),
    metaTag('property', 'og:url', canonical),
    metaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
    metaTag('name', 'twitter:title', title),
    metaTag('name', 'twitter:description', description),
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
  ];

  if (image) {
    tags.push(metaTag('property', 'og:image', image));
    tags.push(metaTag('name', 'twitter:image', image));
  }

  if (post.createdAt && !Number.isNaN(new Date(post.createdAt).getTime())) {
    tags.push(metaTag('property', 'article:published_time', new Date(post.createdAt).toISOString()));
  }
  if (post.updatedAt && !Number.isNaN(new Date(post.updatedAt).getTime())) {
    tags.push(metaTag('property', 'article:modified_time', new Date(post.updatedAt).toISOString()));
  }

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name=["']?description["']?[^>]*>/i, metaTag('name', 'description', description))
    .replace(/<meta\s+name=["']?article-seo-insertion-point["']?[^>]*>/i, tags.join('\n    '));
};