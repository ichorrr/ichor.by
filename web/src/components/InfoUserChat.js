import React from 'react';

const InfoUserChat = ({ userData, onClose }) => {
  if (!userData) return null;

  const styles = {
    panel: {
      position: 'fixed',
      right: 0,
      top: '70px',
      height: '100vh',
      width: '15%',
      backgroundColor: '#fff',
      borderLeft: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflowY: 'auto',
      backdropFilter: 'blur(5px)'
    },
    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: '1px solid rgba(0,0,0,0.08)',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: '#666',
      transition: 'all 0.2s',
      '&:hover': {
        background: 'rgba(0,0,0,0.04)',
        color: '#000'
      }
    },
    avatar: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      marginTop: '60px',
      
      alignSelf: 'center'
    },
    name: {
      marginTop: '20px',
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#222',
      wordBreak: 'break-word'
    },
    placeholder: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      marginTop: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      color: '#fff',
      alignSelf: 'center'
    }
  };

  return (
    <div style={styles.panel}>
      <button
        onClick={onClose}
        style={styles.closeButton}
        title="Close"
        aria-label="Close info panel"
      >
        ✕
      </button>

      {userData.avatar ? (
        <img
          src={userData.avatar}
          alt={userData.name}
          style={styles.avatar}
        />
      ) : (
        <div style={styles.placeholder}>
          {userData.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      <div style={styles.name}>
        {userData.name || 'Unknown User'}
      </div>
    </div>
  );
};

export default InfoUserChat;
