const LOCAL_API_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

export const normalizeRequestHost = hostHeader => {
  const rawHost = String(hostHeader || '').trim().toLowerCase();
  if (rawHost.startsWith('[')) {
    const closingBracket = rawHost.indexOf(']');
    return closingBracket >= 0 ? rawHost.slice(1, closingBracket) : rawHost;
  }
  return rawHost.split(':')[0];
};

export const shouldRedirectToCanonicalHost = (hostHeader, protocol) => {
  const host = normalizeRequestHost(hostHeader);
  if (host === 'api.ichor.by' || LOCAL_API_HOSTS.has(host)) return false;
  return host === 'www.ichor.by' || protocol !== 'https';
};
