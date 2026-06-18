export const getApiUri = () => {
  const envUri = process.env.API_URI || '';
  const normalizedEnv = envUri.trim();

  if (normalizedEnv) {
    const localhostMatch = normalizedEnv.match(/^(https?:)\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/graphql)?/i);
    if (localhostMatch) {
      const protocol = localhostMatch[1] === 'https:' ? 'http:' : localhostMatch[1];
      const host = localhostMatch[2];
      const port = localhostMatch[3] || ':4000';
      return `${protocol}//${host}${port}/graphql`;
    }
    return normalizedEnv;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname)) {
      return 'http://localhost:4000/graphql';
    }
  }

  return 'https://api.ichor.by/graphql';
};

export const getApiBase = () => getApiUri().replace('/graphql', '');

export const getUploadBase = () => 'https://api.ichor.by';
