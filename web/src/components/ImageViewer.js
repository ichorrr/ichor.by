import React, { useRef, useState } from 'react';

const ImageViewer = ({ mediaUrls, startIndex = 0, onClose }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const urls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
  const [currentImageIndex, setCurrentImageIndex] = useState(startIndex);
  const currentMedia = urls[currentImageIndex] || urls[0];
  const mediaType = (() => {
    const ext = currentMedia?.split('?')[0].split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
    return 'file';
  })();

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = currentMedia.split('/').pop().split('?')[0] || `file-${Date.now()}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? urls.length - 1 : prev - 1));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === urls.length - 1 ? 0 : prev + 1));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (mediaType === 'image' && zoom > 1 && e.button === 2) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newOffsetX = e.clientX - dragStart.x;
      const newOffsetY = e.clientY - dragStart.y;
      
      // Limit drag to container bounds
      const container = containerRef.current;
      const img = imgRef.current;
      
      if (container && img) {
        const containerRect = container.getBoundingClientRect();
        const imgWidth = img.naturalWidth * zoom;
        const imgHeight = img.naturalHeight * zoom;
        const viewportWidth = containerRect.width;
        const viewportHeight = containerRect.height;
        
        const maxOffsetX = Math.max(0, (imgWidth - viewportWidth) / 2);
        const maxOffsetY = Math.max(0, (imgHeight - viewportHeight) / 2);
        
        setOffset({
          x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX)),
          y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (mediaType === 'image') {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      }
      if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevImage();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextImage();
    }
  };

  React.useEffect(() => {
    setCurrentImageIndex(urls.length > 0 ? Math.min(Math.max(0, startIndex), urls.length - 1) : 0);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [startIndex, mediaUrls]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, offset, zoom, currentImageIndex, mediaType]);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      cursor: isDragging && zoom > 1 ? 'grabbing' : zoom > 1 ? 'grab' : 'default'
    },
    container: {
      position: 'relative',
      maxWidth: '90vw',
      maxHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: '8px'
    },
    image: {
      transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
      transition: isDragging ? 'none' : 'transform 0.2s',
      objectFit: 'contain',
      borderRadius: '8px',
      userSelect: 'none'
    },
    controls: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      gap: '12px',
      zIndex: 2001,
      flexDirection: 'column'
    },
    navigationControls: {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      zIndex: 2001,
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '12px 16px',
      borderRadius: '20px'
    },
    button: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '8px',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '20px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    },
    navButton: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '6px',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    },
    imageCounter: {
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '60px',
      textAlign: 'center'
    },
    downloadButton: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    },
    info: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#666',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      zIndex: 2001
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose} onContextMenu={handleContextMenu}>
      <div 
        ref={containerRef}
        style={styles.container} 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        {mediaType === 'image' ? (
          <img
            ref={imgRef}
            src={currentMedia}
            alt="Full view"
            style={styles.image}
            draggable={false}
          />
        ) : mediaType === 'video' ? (
          <video
            src={currentMedia}
            controls
            style={{ width: '100%', maxHeight: '90vh', borderRadius: 8, background: '#000' }}
          />
        ) : mediaType === 'audio' ? (
          <div style={{ width: '100%', maxWidth: '90vw', padding: 24, borderRadius: 8, background: '#1e1e1e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#fff', fontSize: 16 }}>🎧 Audio attachment</span>
            <audio controls src={currentMedia} style={{ width: '100%' }} />
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '90vw', padding: 32, borderRadius: 8, background: '#f3f3f3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, color: '#222' }}>📄 File attachment</span>
            <a href={currentMedia} download style={{ color: '#1976d2', textDecoration: 'underline' }}>
              Download file
            </a>
          </div>
        )}
        <div style={styles.controls}>
          <button
            style={styles.downloadButton}
            onMouseEnter={(e) => e.target.style.background = 'rgba(76, 175, 80, 0.9)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
            onClick={handleDownload}
            title="Download file"
          >
            ⬇ Download
          </button>
          {mediaType === 'image' && (
            <>
              <button
                style={styles.button}
                onClick={handleZoomIn}
                onMouseEnter={(e) => e.target.style.background = 'rgba(33, 150, 243, 0.9)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
                title="Zoom in (+ key)"
              >
                🔍+
              </button>
              <button
                style={styles.button}
                onClick={handleZoomOut}
                disabled={zoom === 1}
                onMouseEnter={(e) => zoom > 1 && (e.target.style.background = 'rgba(33, 150, 243, 0.9)')}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
                title="Zoom out (- key)"
              >
                🔍−
              </button>
              <button
                style={styles.button}
                onClick={handleResetZoom}
                disabled={zoom === 1}
                onMouseEnter={(e) => zoom > 1 && (e.target.style.background = 'rgba(33, 150, 243, 0.9)')}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
                title="Reset zoom (0 key)"
              >
                ↺
              </button>
            </>
          )}
          <button
            style={styles.button}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.background = '#fff'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
        
        {/* Navigation controls for multiple attachments */}
        {urls.length > 1 && (
          <div style={styles.navigationControls}>
            <button
              style={styles.navButton}
              onClick={handlePrevImage}
              onMouseEnter={(e) => e.target.style.background = 'rgba(33, 150, 243, 0.9)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
              title="Previous item (← key)"
            >
              ←
            </button>
            <div style={styles.imageCounter}>
              {currentImageIndex + 1} / {urls.length}
            </div>
            <button
              style={styles.navButton}
              onClick={handleNextImage}
              onMouseEnter={(e) => e.target.style.background = 'rgba(33, 150, 243, 0.9)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
              title="Next item (→ key)"
            >
              →
            </button>
          </div>
        )}
        
        {mediaType === 'image' && zoom > 1 && (
          <div style={styles.info}>
            Zoom: {(zoom * 100).toFixed(0)}% | Drag with right mouse button
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
