import React, { useEffect, useState } from 'react';
import { getThumbnailUrl } from '../utils/media';

const getFiles = value => String(value || '').split('|').map(url => url.trim()).filter(Boolean);
const isVideo = url => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url.split('#')[0]);

const PostMediaAsset = ({ url, alt, video = false, className, controls = false, preload = 'metadata' }) => {
  const thumbnail = getThumbnailUrl(url);
  const isStagedUpload = (() => {
    try { return new URL(url, window.location.origin).pathname.includes('/posts/.tmp/'); }
    catch (error) { return false; }
  })();
  const [src, setSrc] = useState(isStagedUpload ? '' : (video ? url : thumbnail || url));

  useEffect(() => {
    if (!isStagedUpload) {
      setSrc(video ? url : thumbnail || url);
      return undefined;
    }
    let cancelled = false;
    let objectUrl = null;
    const fetchMedia = async () => {
      const headers = { Authorization: localStorage.getItem('token') || '' };
      const candidates = video ? [url] : [thumbnail, url].filter(Boolean);
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate, { headers });
          if (!response.ok) continue;
          objectUrl = URL.createObjectURL(await response.blob());
          if (cancelled) URL.revokeObjectURL(objectUrl);
          else setSrc(objectUrl);
          return;
        } catch (error) {}
      }
    };
    fetchMedia();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, thumbnail, isStagedUpload, video]);

  if (!src) return <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>Загрузка…</span>;
  if (video) return <video className={className} src={src} poster={isStagedUpload ? undefined : thumbnail} controls={controls} preload={preload} />;
  return <img className={className} src={src} alt={alt} onError={event => {
    if (!isStagedUpload && event.currentTarget.src !== url) event.currentTarget.src = url;
  }} />;
};

const ImageSlider = ({ images, alt }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [images.join('|')]);

  if (images.length < 2) {
    const image = images[0];
    return <PostMediaAsset url={image} alt={alt} />;
  }

  const showPrevious = () => setActiveIndex(index => (index - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex(index => (index + 1) % images.length);

  return (
    <div className="post-image-slider" aria-label={`Галерея изображений: ${images.length}`}>
      <button type="button" className="post-image-slider__arrow" onClick={showPrevious} aria-label="Предыдущее изображение">‹</button>
      <PostMediaAsset url={images[activeIndex]} alt={`${alt} (${activeIndex + 1}/${images.length})`} />
      <button type="button" className="post-image-slider__arrow" onClick={showNext} aria-label="Следующее изображение">›</button>
      <div className="post-image-slider__count">{activeIndex + 1} / {images.length}</div>
    </div>
  );
};

const PostMedia = ({ urls, enableSlider = false, alt = 'Изображение записи' }) => {
  const files = getFiles(urls);
  if (!files.length) return null;

  if (files.length === 1 && isVideo(files[0])) {
    return <PostMediaAsset className="post-video" url={files[0]} video controls />;
  }

  if (files.some(isVideo)) {
    return files.map(url => isVideo(url)
      ? <PostMediaAsset key={url} className="post-video" url={url} video controls />
      : <PostMediaAsset key={url} url={url} alt={alt} />);
  }

  return enableSlider && files.length > 1
    ? <ImageSlider images={files} alt={alt} />
    : files.map(url => <PostMediaAsset key={url} url={url} alt={alt} />);
};

export default PostMedia;
