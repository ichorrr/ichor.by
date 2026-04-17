import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const LIKE_MUTATION = gql`
  mutation toggleLike($targetId: String!, $type: String!, $likeType: String!) {
    toggleLike(targetId: $targetId, type: $type, likeType: $likeType) {
      _id
      likesCount
      dislikesCount
      userLike
    }
  }
`;

const LikeDislike = ({ 
  targetId, 
  type, // 'post', 'comment', 'message'
  initialLikes = 0, 
  initialDislikes = 0, 
  initialUserLike = null,
  isAuthenticated = false,
  onLikeChange 
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userLike, setUserLike] = useState(initialUserLike);
  const [loading, setLoading] = useState(false);

  const [toggleLike] = useMutation(LIKE_MUTATION, {
    onCompleted: (data) => {
      const result = data.toggleLike;
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setUserLike(result.userLike);
      setLoading(false);
      if (onLikeChange) onLikeChange(result);
    },
    onError: (error) => {
      console.error('Like error:', error);
      setLoading(false);
    }
  });

  const handleLike = async (likeType) => {
    if (!isAuthenticated) {
      alert('Please sign in to like or dislike');
      return;
    }
    
    setLoading(true);
    try {
      await toggleLike({
        variables: {
          targetId,
          type,
          likeType
        }
      });
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    button: {
      background: 'transparent',
      border: 'none',
      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
      fontSize: '18px',
      padding: '4px 8px',
      transition: 'all 0.2s',
      opacity: isAuthenticated ? 1 : 0.5,
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    likeButton: {
      color: userLike === 'like' ? '#4caf50' : '#999'
    },
    dislikeButton: {
      color: userLike === 'dislike' ? '#d32f2f' : '#999'
    },
    rating: {
      fontSize: '14px',
      color: '#666',
      minWidth: '30px',
      fontWeight: '600'
    },
    count: {
      fontSize: '12px',
      color: '#999'
    }
  };

  const rating = likes - dislikes;

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.button, ...styles.likeButton }}
        onClick={() => handleLike('like')}
        disabled={loading || !isAuthenticated}
        title="Like"
      >
        👍 {likes > 0 && <span style={styles.count}>{likes}</span>}
      </button>

      <button
        style={{ ...styles.button, ...styles.dislikeButton }}
        onClick={() => handleLike('dislike')}
        disabled={loading || !isAuthenticated}
        title="Dislike"
      >
        👎 {dislikes > 0 && <span style={styles.count}>{dislikes}</span>}
      </button>

      <span style={styles.rating}>
        {rating > 0 ? '+' : ''}{rating}
      </span>
    </div>
  );
};

export default LikeDislike;
