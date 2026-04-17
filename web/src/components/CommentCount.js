import React from 'react';

/**
 * Displays a simple comment count string. Renders nothing if count is
 * undefined/null.
 *
 * Props:
 *   - count: number of comments
 *   - text: optional format string, default "{count} comments"
 *   - style, className: styling overrides
 */
const CommentCount = ({ count = 0, text, style = {}, className = '' }) => {
  if (count == null) return null;
  const display = text ? text.replace('{count}', count) : `${count} comments`;
  return (
    <span className={className} style={style}>{display}</span>
  );
};

export default CommentCount;
