import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_USER_MESSAGES } from '../gql/query';
import FormMessage from './FormMessage';

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
mutation createMessage($text: String!, $file: String, $addressee: String!) {
    createMessage(text: $text, file: $file, addressee: $addressee) {
        _id
        text
        createdAt
        author {
            _id
            name
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
  mutation updateMessage($_id: String!, $text: String!) {
    updateMessage(_id: $_id, text: $text) {
      _id
      text
      createdAt
    }
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

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

    const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    // automatically refetch messages after delete
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
  });

  const [updateMessage] = useMutation(UPDATE_MESSAGE, {
    refetchQueries: [{
      query: GET_USER_MESSAGES,
      variables: { addressee: [`${props.mem}`, `${props.myId}`] }
    }],
    awaitRefetchQueries: true,
    onError: (err) => console.error('updateMessage error', err)
  });
  
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
    refetchQueries: [{ query: GET_USER_MESSAGES, variables: { addressee: [`${props.mem}`, `${props.myId}`] } }],
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
      if (!menuRef.current) {
        setOpenMenuId(null);
        return;
      }
      if (!menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
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

  const handleSendMessage = (text) => {
    if (!text || !props.mem) return;
    createMessage({
      variables: {
        text,
        file: null,
        addressee: props.mem
      }
    });
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
  return (
    <>
      <div className='messages-block'>
        <h2>{props.nameChatId}</h2>
        {messages.map(({ _id, text, createdAt, author }) => (
          <div
            key={_id}
            id={_id}
            className='message-block'
            style={{ position: 'relative', padding: 10 }}
            onContextMenu={(e) => { if (author?._id === props.myId) openMenuAt(e, _id); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className='author-message'>{author?.name ?? 'Unknown'}</span>
              <span style={{ color: '#888', fontSize: 12 }}>{createdAt ? new Date(createdAt).toLocaleString() : ''}</span>

              {author?._id === props.myId && (
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <button
                    title="Message menu"
                    style={styles.menuButton}
                    onClick={(e) => { e.stopPropagation(); openMenuNearButton(e, _id); }}
                  >
                    ⋯
                  </button>

                  {openMenuId === _id && (
                    <div
                      ref={menuRef}
                      style={{ ...styles.menuContainer, left: `${menuPos.left}px`, top: `${menuPos.top}px`, position: 'fixed' }}
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
              <p style={{ marginTop: 8 }}>{text}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <FormMessage onSend={handleSendMessage} />
      </div>
    </>
  );
}

export default Messages;