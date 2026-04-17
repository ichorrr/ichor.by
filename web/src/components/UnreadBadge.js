import React from 'react';

/**
 * Simple badge used to display an unread message count. If `count` is
 * falsy or zero nothing is rendered.
 *
 * Props:
 *   - count: number of unread items
 *   - style: optional override for container style
 *   - className: optional CSS class
 */
const UnreadBadge = ({ count, style = {}, className = '' }) => {
  if (!count || count <= 0) return null;

  const defaultStyle = {
    background: '#ff4d4f',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    minWidth: '20px',
    textAlign: 'center',
    display: 'inline-block',
    lineHeight: 1,
  };

  return (
    <div className={className} style={{ ...defaultStyle, ...style }}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default UnreadBadge;
