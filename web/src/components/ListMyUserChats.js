import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_MY_LIST_USERS_CHATS, GET_USERS } from '../gql/query';
import { DELETE_USER_FROM_CHATS } from '../gql/mutation';
import UnreadBadge from './UnreadBadge';

const truncate = (text, n = 15) => (text && text.length > n ? text.slice(0, n) + '...' : text || '');

const formatLastVisit = (date) => {
    if (!date) return '';
    const visitDate = new Date(date);
    const now = new Date();
    const diffMs = now - visitDate;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 14) return 'был давно';
    if (diffDays > 7) return 'был неделю назад';

    return visitDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
    }) + ' ' + visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ListMyUserChats = ({ onSelectChat, compactMode = false, activeUserIdOverride }) => {
    // hooks
    const [query, setQuery] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuUserId, setContextMenuUserId] = useState(null);
    const { id: routeActiveUserId } = useParams();
    const activeUserId = activeUserIdOverride ?? routeActiveUserId;

    const { loading: loadingMessages, error: errorMessages, data: dataMessages, refetch } = useQuery(GET_MY_LIST_USERS_CHATS, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
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
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: false,
    });

    const chats = useMemo(() => {
        if (!Array.isArray(dataMessages?.getMyListUsersChats)) return [];
        return dataMessages.getMyListUsersChats;
    }, [dataMessages?.getMyListUsersChats]);

    const visibleChats = useMemo(() => {
        if (!query.trim()) return chats;
        const q = query.trim().toLowerCase();
        return chats.filter(item => {
            const name = (item.name || '').toLowerCase();
            const lastText = (item.lastMessage?.text || '').toLowerCase();
            return name.includes(q) || lastText.includes(q);
        });
    }, [chats, query]);

    const filteredChats = visibleChats;

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

    if (loadingMessages && !dataMessages) return <p className="lc-chat-list-empty-state">Loading chats...</p>;
    if (errorMessages) return <p className="lc-chat-list-empty-state">Error loading chats: {errorMessages.message}</p>;

    const showGlobal = shouldSearchAll;

    return (
        <div className="lc-chat-list-container">
            <div className="lc-chat-list-header">
                <form className="lc-chat-list-search-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                        aria-label="Search users"
                        placeholder="Search users (type 2+ chars) or messages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="lc-chat-list-search-input"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="lc-chat-list-clear-button"
                        >
                            ×
                        </button>
                    ) : null}
                </form>
            </div>

            {showGlobal ? (
                <>
                    {loadingAllUsers && <div className="lc-chat-list-empty-state">Searching users...</div>}
                    {errorAllUsers && <div className="lc-chat-list-empty-state">Search error: {errorAllUsers.message}</div>}
                    {!loadingAllUsers && searchResults.length === 0 && <div className="lc-chat-list-empty-state">No users found</div>}
                    {searchResults.map(user => {
                        const id = user._id;
                        const subtitle = user.email || user.telephone || '';
                        const handleClick = () => {
                            if (typeof onSelectChat === 'function') {
                                onSelectChat(id);
                            }
                        };
                        return compactMode ? (
                            <button key={id} type="button" onClick={handleClick} className="lc-chat-list-item lc-chat-list-item-compact">
                                <img src={user.avatar || `https://api.ichor.by/avatars/default-avatar.png`} alt={user.name} className="lc-chat-list-avatar" />
                                <div className="lc-chat-list-info">
                                    <div className="lc-chat-list-name">{user.name}</div>
                                    <div className="lc-chat-list-last-message-preview lc-chat-list-search-subtitle">{subtitle}</div>
                                </div>
                            </button>
                        ) : (
                            <a key={id} href={`/chat/${id}`} className="lc-chat-list-item">
                                <img src={user.avatar || `https://api.ichor.by/avatars/default-avatar.png`} alt={user.name} className="lc-chat-list-avatar" />
                                <div className="lc-chat-list-info">
                                    <div className="lc-chat-list-name">{user.name}</div>
                                    <div className="lc-chat-list-last-message-preview lc-chat-list-search-subtitle">{subtitle}</div>
                                </div>
                            </a>
                        );
                    })}
                </>
            ) : (
                filteredChats.map(({ _id, name, avatar, lastMessage, lastVisit, unreadCount }) => {
                    let preview;
                    if (lastMessage?.text) {
                        preview = truncate(lastMessage.text, 15);
                    } else if (lastMessage?.file) {
                        preview = '📷 Image';
                    } else {
                        preview = 'No messages yet';
                    }
                    const timeStr = lastMessage?.createdAt ? `${new Date(lastMessage.createdAt).toLocaleDateString()} ${new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
                    const unreadCountValue = unreadCount || lastMessage?.unreadCount || 0;
                    const itemClassName = activeUserId === _id ? 'lc-chat-list-item lc-chat-list-item-active' : 'lc-chat-list-item';
                    const handleClick = () => {
                        if (typeof onSelectChat === 'function') {
                            onSelectChat(_id);
                        }
                    };

                    return compactMode ? (
                        <button
                            key={_id}
                            type="button"
                            className={`lc-chat-list-item lc-chat-list-item-compact ${activeUserId === _id ? 'lc-chat-list-item-active' : ''}`}
                            onClick={handleClick}
                            onContextMenu={(e) => handleContextMenu(e, _id)}
                        >
                            <img
                                src={avatar || `https://api.ichor.by/avatars/default-avatar.png`}
                                alt={name}
                                className="lc-chat-list-avatar"
                            />
                            <div className="lc-chat-list-info">
                                <div className="lc-chat-list-name">{name}</div>
                                <div className="lc-chat-list-last-message-row">
                                    <div className="lc-chat-list-last-message-preview">{preview}</div>
                                    <div className="lc-chat-list-right">
                                        <div className="lc-chat-list-time">{timeStr}</div>
                                        <UnreadBadge count={unreadCountValue} />
                                    </div>
                                </div>
                                {lastVisit ? (
                                    <div className="lc-chat-list-visit-info">{formatLastVisit(lastVisit)}</div>
                                ) : null}
                            </div>
                        </button>
                    ) : (
                        <Link
                            key={_id}
                            to={`/chat/${_id}`}
                            className={itemClassName}
                            onContextMenu={(e) => handleContextMenu(e, _id)}
                        >
                            <img
                                src={avatar || `https://api.ichor.by/avatars/default-avatar.png`}
                                alt={name}
                                className="lc-chat-list-avatar"
                            />
                            <div className="lc-chat-list-info">
                                <div className="lc-chat-list-name">{name}</div>
                                <div className="lc-chat-list-last-message-row">
                                    <div className="lc-chat-list-last-message-preview">{preview}</div>
                                    <div className="lc-chat-list-right">
                                        <div className="lc-chat-list-time">{timeStr}</div>
                                        <UnreadBadge count={unreadCountValue} />
                                    </div>
                                </div>
                                {lastVisit ? (
                                    <div className="lc-chat-list-visit-info">{formatLastVisit(lastVisit)}</div>
                                ) : null}
                            </div>
                        </Link>
                    );
                })
            )}

            {contextMenu && (
                <div className="lc-chat-list-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button
                        className="lc-chat-list-context-menu-item lc-chat-list-context-menu-item-delete"
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