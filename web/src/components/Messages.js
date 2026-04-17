import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { GET_MY_LIST_USERS_CHATS, GET_USER_MESSAGES } from '../gql/query';
import FormMessage from './FormMessage';
import InfoUserChat from './InfoUserChat';
import ImageViewer from './ImageViewer';
import LikeDislike from './LikeDislike';
import { addListener } from 'process';

const styles = {
  deleteButton: {
    marginLeft: 8,
    background: 'transparent',
    border: '1px solid rgba(211,47,47,0.12)',
    color: '#d32f2f',
    cursor: 'pointer',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 6,
    transition: 'background 0.12s, transform 0.06s',
  },
  deleteButtonHover: {
    background: 'rgba(211,47,47,0.06)',
    transform: 'translateY(-1px)'
  },
  menuButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 8px',
    color: '#666'
  },

  menuButtonHover: {
    background: 'rgba(0,0,0,0.04)',
    color: '#d41313'
  },

  menuContainer: {
    position: 'absolute',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    zIndex: 50,
    minWidth: 140,
    overflow: 'hidden'
  },
  menuItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
    color: '#222',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
    background: 'transparent'
  },
  menuItemDanger: {
    color: '#d32f2f'
  },
  editInput: {
    width: '100%',
    padding: '8px',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    boxSizing: 'border-box'
  },
  editActions: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
  saveBtn: {
    background: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  },
  cancelBtn: {
    background: 'transparent',
    color: '#666',
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  }
};

const CREATE_MESSAGE = gql`
mutation createMessage($text: String, $file: String, $addressee: String!) {
    createMessage(text: $text, file: $file, addressee: $addressee) {
        _id
        text
        file
        read
        createdAt
        author {
            _id
            name
            avatar
        }
        addressee 
    }
}
`;

const DELETE_MESSAGE = gql`
  mutation deleteMessage($id: String!) {
    deleteMessage(_id: $id)
  }
`;

const UPDATE_MESSAGE = gql`
  mutation updateMessage($_id: String!, $text: String!, $file: String) {
    updateMessage(_id: $_id, text: $text, file: $file) {
      _id
      text
      file
      createdAt
    }
  }
`;

const DELETE_IMAGES_IN_MESSAGE = gql`
  mutation deleteImagesInMessage($_id: String!, $imageIndex: Int) {
    deleteImagesInMessage(_id: $_id, imageIndex: $imageIndex) {
      _id
      file
    }
  }
`;

const CLEAR_CHAT = gql`
  mutation clearChat($addressee: String!) {
    clearChat(addressee: $addressee)
  }
`;


const Messages = props => {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_USER_MESSAGES, {
    variables: { addressee: [`${props.mem}`, `${props.myId}`] }
  });

  const [messages, setMessages] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  const menuRef = useRef(null);
  
  // Context menu state (for right-click)
  const [contextMenuId, setContextMenuId] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ left: 0, top: 0 });
  const contextMenuRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  // Image context menu state
  const [imageMenuId, setImageMenuId] = useState(null);
  const [imageMenuPos, setImageMenuPos] = useState({ left: 0, top: 0 });
  const imageMenuRef = useRef(null);

  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [chatMenuId, setChatMenuId] = useState(null);
  const chatMenuRef = useRef(null);

  // Image viewer state
  const [viewImageUrl, setViewImageUrl] = useState(null);

    const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    // automatically refetch messages after delete
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
  });

  const [deleteImagesInMessage] = useMutation(DELETE_IMAGES_IN_MESSAGE, {
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
    onError: (err) => console.error('deleteImagesInMessage error', err)
  });

  const [updateMessage] = useMutation(UPDATE_MESSAGE, {
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
    onError: (err) => console.error('updateMessage error', err)
  });

  const [clearChat] = useMutation(CLEAR_CHAT, {
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
    onError: (err) => console.error('clearChat error', err)
  });

  // Get user data from chat list
  const { data: chatsData } = useQuery(GET_MY_LIST_USERS_CHATS);
  const [chatUserData, setChatUserData] = useState(null);

  useEffect(() => {
    if (chatsData?.getMyListUsersChats) {
      const user = chatsData.getMyListUsersChats.find(chat => chat._id === props.mem);
      if (user) {
        setChatUserData(user);
      }
    }
  }, [chatsData, props.mem]);
  
  // sync local state with query result
  useEffect(() => {
    if (Array.isArray(data?.getUserMessages)) {
      setMessages(data.getUserMessages);
    }
  }, [data]);

const lastMessage = messages[messages.length - 1];
useEffect(() => {
    if (lastMessage) {
      const messageElement = document.getElementById(lastMessage._id);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth' });
      } 
    }
}, [lastMessage]);

  const [createMessage] = useMutation(CREATE_MESSAGE, {
    refetchQueries: [{ query: GET_USER_MESSAGES, variables: { addressee: [`${props.mem}`, `${props.myId}`] } },
  { query: GET_MY_LIST_USERS_CHATS }], 
    // update local list when mutation returns
    onCompleted: (res) => {
      if (res?.createMessage) {
        setMessages(prev => [...prev, res.createMessage]);
        navigate(`/chat/${props.mem}`);
      }
    },
    onError: (error) => {
      console.error("Error creating message:", error);
    }
  });

  useEffect(() => {
    const onDocClick = (e) => {
      // Close message menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
      // Close context menu
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenuId(null);
      }
      // Close image menu
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target)) {
        setImageMenuId(null);
      }
      // Close chat menu
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) {
        setChatMenuId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
        setContextMenuId(null);
        setImageMenuId(null);
        setChatMenuId(null);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const formatLastVisit = (date) => {
    if (!date) return 'No messages yet';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} миин назад`;
    if (diffHours < 24) return `${diffHours} часов${diffHours > 1 ? 's' : ''} назад`;
    if (diffDays < 7) return `${diffDays} дней${diffDays > 1 ? 's' : ''} назад`;
    
    return messageDate.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = (text, fileUrl) => {
    console.log('handleSendMessage called', { text, fileUrl, mem: props.mem });
    if ((!text && !fileUrl) || !props.mem) return;
    createMessage({
      variables: {
        text: text || '',
        file: fileUrl || null,
        addressee: props.mem
      }
    });
    // notify other components (eg. ListMyUserChats) to reload
    try { window.dispatchEvent(new Event('reloadChats')); } catch(e){}
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await deleteMessage({ variables: { id } });
      // optional check server response
      if (res?.data?.deleteMessage === false) {
        throw new Error('Server refused to delete message');
      }
      // use refetch if available
      if (typeof refetch === 'function') await refetch();
      setOpenMenuId(null);
    } catch (err) {
      console.error('Delete message error', err);
      alert('Failed to delete message: ' + (err.message || 'unknown'));
    }
  };

  const openMenuAt = (e, messageId) => {
    e.preventDefault();
    e.stopPropagation();
    const left = e.clientX;
    const top = e.clientY;
    setMenuPos({ left, top });
    setOpenMenuId(openMenuId === messageId ? null : messageId);
  };

  const openMenuNearButton = (e, messageId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const left = rect.right - 8;
    const top = rect.bottom + 6;
    setMenuPos({ left, top });
    setOpenMenuId(openMenuId === messageId ? null : messageId);
  };
   const startEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || '');
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editingMessageId) return;
    const trimmed = (editText || '').trim();
    if (!trimmed) {
      alert('Message cannot be empty');
      return;
    }
    try {
      await updateMessage({ variables: { _id: editingMessageId, text: trimmed } });
      if (typeof refetch === 'function') await refetch();
      setEditingMessageId(null);
      setEditText('');
    } catch (err) {
      console.error('Update message error', err);
      alert('Failed to update message');
    }
  };

  const onDeleteImage = async (messageId, imageIndex) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteImagesInMessage({ variables: { _id: messageId, imageIndex } });
      setImageMenuId(null);
    } catch (err) {
      console.error('Delete image error', err);
      alert('Failed to delete image: ' + (err.message || 'unknown'));
    }
  };

  const onImageContextMenu = (e, messageId, imageIndex, imageUrl) => {
    e.preventDefault();
    e.stopPropagation();
    const left = e.clientX;
    const top = e.clientY;
    setImageMenuPos({ left, top });
    setImageMenuId(`${messageId}-${imageIndex}`);
  };

  const copyMessage = (text) => {
    if (!text) {
      alert('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setContextMenuId(null);
    }).catch(() => {
      alert('Failed to copy message');
    });
  };

  const openChatMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const left = rect.right - 8;
    const top = rect.bottom + 6;
    setChatMenuId(chatMenuId ? null : 'chat-menu');
  };

  const onClearChat = async () => {
    if (!window.confirm('Clear all messages in this chat? This cannot be undone.')) return;
    try {
      await clearChat({ variables: { addressee: props.mem } });
      setChatMenuId(null);
    } catch (err) {
      console.error('Clear chat error', err);
      alert('Failed to clear chat: ' + (err.message || 'unknown'));
    }
  };
  return (
    <>
      <div className='head-chat-name'> 
            <ul style={{alignItems: 'center', display: 'inline', float: 'left', width: '100%'}}>
              <li>
                <Link to='/myposts'  className="css-back-chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
                  <path className="xcls-2" d="M31.96,29.476l-2.594,2.347-6.052-5.476L17.619,31.5l-2.594-2.347L20.72,24l-5.694-5.152L17.619,16.5l5.694,5.152,6.052-5.476,2.594,2.347L25.908,24Z"/>
                </svg>
              </Link>
              </li>
              <li>
                <h2>{props.nameChatId}</h2>
                <p className='last-visit'>
                Последнее посещение: {chatUserData?.lastVisit ? formatLastVisit(chatUserData.lastVisit) : 'No info'}
                </p>
              </li>
              
              <li className='rButMenu'>
                <button
                  title="Chat menu"
                  style={styles.menuButton}
                  onClick={openChatMenu}
                >
                  ⋯
                </button>

                {chatMenuId && (
                  <div
                    ref={chatMenuRef}
                    style={{ ...styles.menuContainer, position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 100 }}
                    role="menu"
                    aria-label="chat menu"
                  >
                    <div style={styles.menuItem} onClick={() => { setShowInfoPanel(true); setChatMenuId(null); }} role="menuitem">
                      Информация о собеседнике
                    </div>
                    <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={onClearChat} role="menuitem">
                      Очистить чат
                    </div>
                  </div>
                )}
              </li>
              </ul>
          </div>
      <div className='messages-block'>
        
          <div className='all-messages-block'>
            {messages.map(({ _id, text, file, read, createdAt, author, likesCount = 0, dislikesCount = 0, userLike = null }) => {
              const mine = author?._id === props.myId;
              return (
              <div
                key={_id}
                id={_id}
                className={`message-block ${mine ? 'mine' : 'their'}`}
                style={{ position: 'relative' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const left = e.clientX;
                  const top = e.clientY;
                  setContextMenuPos({ left, top });
                  setContextMenuId(_id);
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className='author-message'>{author?.name ?? 'Unknown'}</span>
              <span style={{ color: '#888', fontSize: 12 }}>{createdAt ? new Date(createdAt).toLocaleString() : ''}</span>
              {mine && typeof read === 'boolean' && (
                <span style={{ marginLeft: 6, color: read ? '#4caf50' : '#999', fontSize: 12 }} title={read ? 'Read' : 'Unread'}>
                  {read ? '✓' : '⌛'}
                </span>
              )}

              {author?._id === props.myId && (
                <div style={{ marginLeft: 'auto', marginTop: '-.5em' }}>
                  <button 
                    title="Message menu"
                    style={styles.menuButton}
                    onClick={(e) => { e.stopPropagation(); openMenuNearButton(e, _id);  }}
                  >
                    ⋯
                  </button>

                  {openMenuId === _id && (
                    <div
                      ref={menuRef}
                      style={{ ...styles.menuContainer, right: `2em`, top: `${menuPos.top}px`, position: 'fixed', zIndex: 9999999 }}
                      role="menu"
                      aria-label="message menu"
                    >
                      <div style={styles.menuItem} onClick={() => startEdit({ _id, text })} role="menuitem">Edit</div>
                      <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={() => onDelete(_id)} role="menuitem">Delete</div>
                      <div style={styles.menuItem} onClick={() => setOpenMenuId(null)} role="menuitem">Cancel</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* message content or inline editor */}
            {editingMessageId === _id ? (
              <div style={{ marginTop: 8 }}>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={styles.editInput}
                  rows={3}
                />
                <div style={styles.editActions}>
                  <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
                  <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                {text && <p>{text}</p>}
                {file && (
                  <div>
                    {file.includes('|') ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {file.split('|').map((imageUrl, idx) => (
                          <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                            <img
                              src={imageUrl}
                              alt={`attachment-${idx}`}
                              style={{ maxWidth: '200px', height: '200px', objectFit: 'cover', display: 'block', borderRadius: 6, cursor: 'pointer' }}
                              onClick={() => setViewImageUrl(imageUrl)}
                              onContextMenu={(e) => mine && onImageContextMenu(e, _id, idx, imageUrl)}
                            />
                            {imageMenuId === `${_id}-${idx}` && mine && (
                              <div
                                ref={imageMenuRef}
                                style={{ ...styles.menuContainer, left: `${imageMenuPos.left}px`, top: `${imageMenuPos.top}px`, position: 'fixed', zIndex: 9999999 }}
                                role="menu"
                                aria-label="image menu"
                              >
                                <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={() => onDeleteImage(_id, idx)} role="menuitem">
                                  Удалить изображение
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={file}
                          alt="attachment"
                          style={{ maxWidth: '200px', display: 'block', marginTop: 8, borderRadius: 6, cursor: 'pointer' }}
                          onClick={() => setViewImageUrl(file)}
                          onContextMenu={(e) => mine && onImageContextMenu(e, _id, 0, file)}
                        />
                        {imageMenuId === `${_id}-0` && mine && (
                          <div
                            ref={imageMenuRef}
                            style={{ ...styles.menuContainer, left: `${imageMenuPos.left}px`, top: `${imageMenuPos.top}px`, position: 'fixed', zIndex: 9999999 }}
                            role="menu"
                            aria-label="image menu"
                          >
                            <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={() => onDeleteImage(_id, 0)} role="menuitem">
                              Удалить изображение
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Context menu for right-click */}
                {contextMenuId === _id && (
                  <div
                    ref={contextMenuRef}
                    style={{ ...styles.menuContainer, left: `${contextMenuPos.left}px`, top: `${contextMenuPos.top}px`, position: 'fixed', zIndex: 9999999 }}
                    role="menu"
                    aria-label="context menu"
                  >
                    <div style={styles.menuItem} onClick={() => copyMessage(text)} role="menuitem">
                      Скопировать сообщение
                    </div>
                    {mine && (
                      <>
                        <div style={styles.menuItem} onClick={() => { setContextMenuId(null); startEdit({ _id, text }); }} role="menuitem">
                          Edit
                        </div>
                        <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={() => { setContextMenuId(null); onDelete(_id); }} role="menuitem">
                          Delete
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Like/Dislike component */}
                <div style={{ marginTop: 12 }}>
                  <LikeDislike
                    targetId={_id}
                    type="message"
                    initialLikes={likesCount}
                    initialDislikes={dislikesCount}
                    initialUserLike={userLike}
                    isAuthenticated={!!props.myId}
                  />
                </div>
              </div>
            )}
          </div>
              );
            })}
      </div>
      <div>
        <FormMessage onSend={handleSendMessage} />
      </div>
      </div>

      {showInfoPanel && (
        <InfoUserChat 
          userData={chatUserData} 
          onClose={() => setShowInfoPanel(false)}
        />
      )}

      {viewImageUrl && (
        <ImageViewer
          imageUrl={viewImageUrl}
          onClose={() => setViewImageUrl(null)}
        />
      )}
    </>
  );
}

export default Messages;