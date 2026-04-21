import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_MY_LIST_USERS_CHATS, GET_USERS } from '../gql/query';
import { DELETE_USER_FROM_CHATS } from '../gql/mutation';
import UnreadBadge from './UnreadBadge';

const styles = {
    container: {
        maxWidth: '420px',
        margin: '20px auto',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        fontFamily: 'Segoe UI, Arial, sans-serif',
    },
    header: {
        padding: '12px 14px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    searchForm: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        outline: 'none',
        fontSize: 14,
        background: '#fafafa'
    },
    clearButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        fontSize: 16,
        padding: '4px 6px'
    },
    chatItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 14px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background 0.15s',
        textDecoration: 'none',
        color: 'inherit'
    },
    chatItemActive: {
        background: '#e3f2fd',
        borderLeft: '4px solid #2196F3',
    },
    chatItemHover: {
        background: '#fafafa',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        marginRight: '12px',
        objectFit: 'cover',
        flexShrink: 0,
    },
    chatInfo: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    name: {
        fontWeight: 600,
        fontSize: '1rem',
        color: '#222',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    lastMessageRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    lastMessagePreview: {
        fontSize: '0.95rem',
        color: '#666',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
        marginRight: '8px'
    },
    right: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: '72px',
        gap: '6px',
    },
    time: {
        fontSize: '0.78rem',
        color: '#9aa0a6',
    },
    unreadBadge: {
        background: '#ff4d4f',
        color: '#fff',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '0.78rem',
        fontWeight: 700,
        minWidth: '20px',
        textAlign: 'center',
    },
    emptyState: {
        padding: '20px',
        textAlign: 'center',
        color: '#777'
    },
    contextMenu: {
        position: 'fixed',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '180px',
    },
    contextMenuItem: {
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        fontSize: '14px',
        color: '#222',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
    },
    contextMenuItemDelete: {
        color: '#ff4d4f',
    },
};

const truncate = (text, n = 15) => (text && text.length > n ? text.slice(0, n) + '...' : text || '');

const ListMyUserChats = () => {
    // hooks
    const [query, setQuery] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuUserId, setContextMenuUserId] = useState(null);
    const { id: activeUserId } = useParams(); // Get current active chat user ID from URL

    
    const API_BASE = process.env.API_URI.replace('/graphql', '');

    const { loading: loadingMessages, error: errorMessages, data: dataMessages, refetch } = useQuery(GET_MY_LIST_USERS_CHATS, {
        fetchPolicy: 'network-only',
    });

    const [deleteUserFromChats] = useMutation(DELETE_USER_FROM_CHATS, {
        onCompleted: () => {
            refetch();
            setContextMenu(null);
        },
        onError: (error) => {
            console.error('Delete user error:', error);
            alert('Failed to delete user from chats');
        }
    });

    // listen for global reload requests (sent after sending a message)
    React.useEffect(() => {
        const onReload = () => {
            if (typeof refetch === 'function') refetch();
        };
        window.addEventListener('reloadChats', onReload);
        return () => window.removeEventListener('reloadChats', onReload);
    }, [refetch]);

    // Close context menu when clicking elsewhere
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenu) {
                setContextMenu(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    const handleContextMenu = (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuUserId(userId);
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDeleteUser = async () => {
        if (!contextMenuUserId) return;
        if (!window.confirm('Are you sure you want to delete this user from your chats? This will also delete all messages with this user.')) {
            return;
        }
        await deleteUserFromChats({
            variables: { userId: contextMenuUserId }
        });
    };

const shouldSearchAll = (query || '').trim().length >= 2;
    const { loading: loadingAllUsers, error: errorAllUsers, data: dataAllUsers } = useQuery(GET_USERS, {
        skip: !shouldSearchAll,
        fetchPolicy: 'network-only',
    });

    const chats = useMemo(() => {
        if (!Array.isArray(dataMessages?.getMyListUsersChats)) return [];
        return dataMessages.getMyListUsersChats;
    }, [dataMessages?.getMyListUsersChats]);

    // filtered list by search query (name or last message text) for chats
    const filteredChats = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        if (!q) return chats;
        return chats.filter(item => {
            const name = (item.name || '').toLowerCase();
            const lastText = (item.lastMessage?.text || '').toLowerCase();
            return name.includes(q) || lastText.includes(q);
        });
    }, [chats, query]);

    // when searching globally, filter all users from DB
    const searchResults = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        if (!shouldSearchAll) return [];
        const users = Array.isArray(dataAllUsers?.getUsers) ? dataAllUsers.getUsers : [];
        return users
            .filter(u => {
                const name = (u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                return name.includes(q) || email.includes(q);
            })
            .slice(0, 50); // limit results
    }, [dataAllUsers?.getUsers, query, shouldSearchAll]);

    if (loadingMessages) return <p style={styles.emptyState}>Loading chats...</p>;
    if (errorMessages) return <p style={styles.emptyState}>Error loading chats: {errorMessages.message}</p>;
   

    const showGlobal = shouldSearchAll;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <form style={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
                    <input
                        aria-label="Search users"
                        placeholder="Search users (type 2+ chars) or messages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={styles.searchInput}
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            style={styles.clearButton}
                        >
                            ×
                        </button>
                    ) : null}
                </form>
            </div>

{showGlobal ? (
                // global search results
                <>
                  {loadingAllUsers && <div style={styles.emptyState}>Searching users...</div>}
                  {errorAllUsers && <div style={styles.emptyState}>Search error: {errorAllUsers.message}</div>}
                  {!loadingAllUsers && searchResults.length === 0 && <div style={styles.emptyState}>No users found</div>}
                  {searchResults.map(user => {
                      const id = user._id;
                      const subtitle = user.email || user.telephone || '';
                      return (
                        <a key={id} href={`/chat/${id}`} style={styles.chatItem}>
                          <img src={user.avatar || `${API_BASE}/avatars/default-avatar.png`} alt={user.name} style={styles.avatar} />
                          <div style={styles.chatInfo}>
                              <div style={styles.name}>{user.name}</div>
                              <div style={{ ...styles.lastMessagePreview, fontSize: 13, color: '#888' }}>{subtitle}</div>
                          </div>
                        </a>
                      );
                  })}
                </>
            ) : (
                // chats list (filtered by query if any)
                filteredChats.map(({ _id, name, avatar, lastMessage }) => {
                    let preview;
                    if (lastMessage?.text) {
                        preview = truncate(lastMessage.text, 15);
                    } else if (lastMessage?.file) {
                        preview = '📷 Image';
                    } else {
                        preview = 'No messages yet';
                    }
                    const timeStr = lastMessage?.createdAt ? `${new Date(lastMessage.createdAt).toLocaleDateString()} ${new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
                    const unreadCount = lastMessage?.unreadCount || 0;

                return (
                     <a
                            key={_id}
                            href={`/chat/${_id}`}
                            style={activeUserId === _id ? { ...styles.chatItem, ...styles.chatItemActive } : styles.chatItem}
                            onContextMenu={(e) => handleContextMenu(e, _id)}
                        >
                            <img
                                src={avatar || `${API_BASE}/avatars/default-avatar.png`}
                                alt={name}
                                style={styles.avatar}
                            />
                            <div style={styles.chatInfo}>
                                <div style={styles.name}>{name}</div>
                                <div style={styles.lastMessageRow}>
                                    <div style={styles.lastMessagePreview}>{preview}</div>
                                    <div style={styles.right}>
                                        <div style={styles.time}>{timeStr}</div>
                                        <UnreadBadge count={unreadCount} />
                                    </div>
                                </div>
                            </div>
                        </a>
                );
                })
            )}

            {contextMenu && (
                <div style={{ ...styles.contextMenu, top: contextMenu.y, left: contextMenu.x }}>
                    <button
                        style={{ ...styles.contextMenuItem, ...styles.contextMenuItemDelete }}
                        onClick={handleDeleteUser}
                    >
                        Delete from chats
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListMyUserChats;