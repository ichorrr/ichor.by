import React, { useRef, useState } from 'react';

const ImageViewer = ({ imageUrl, onClose }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image');
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

  const handleMouseDown = (e) => {
    if (zoom > 1 && e.button === 2) { // Right mouse button
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
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, offset, zoom]);

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
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Full view"
          style={styles.image}
          draggable={false}
        />
        <div style={styles.controls}>
          <button
            style={styles.downloadButton}
            onMouseEnter={(e) => e.target.style.background = 'rgba(76, 175, 80, 0.9)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
            onClick={handleDownload}
            title="Download image"
          >
            ⬇ Download
          </button>
          
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
        
        {zoom > 1 && (
          <div style={styles.info}>
            Zoom: {(zoom * 100).toFixed(0)}% | Drag with right mouse button
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
