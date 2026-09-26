const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

export const isVideoUrl = value => {
  try {
    const extension = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://ichor.by')
      .pathname.split('.').pop()?.toLowerCase();
    return VIDEO_EXTENSIONS.includes(extension);
  } catch (error) {
    return false;
  }
};

export const getThumbnailUrl = value => {
  if (!value) return '';
  try {
    const url = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://ichor.by');
    const filename = url.pathname.split('/').pop() || '';
    const dot = filename.lastIndexOf('.');
    const thumbnail = `${dot > 0 ? filename.slice(0, dot) : filename}.thumb.webp`;
    url.pathname = `${url.pathname.slice(0, url.pathname.length - filename.length)}${thumbnail}`;
    return url.toString();
  } catch (error) {
    return '';
  }
};
