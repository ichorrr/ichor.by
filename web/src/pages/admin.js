import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_ME } from '../gql/query';
import Post from '../components/Post';
import '../css/admin.css';

const GET_PENDING_POSTS = gql`
  query getPendingPosts {
    getPendingPosts {
      _id
      title
      createdAt
      status
      moderationNote
      category {
        _id
        catname
      }
      author {
        _id
        name
      }
      body
      imageUrl
      externalSource {
        icon
        url
      }
      tags
      viewsCount
      likesCount
      dislikesCount
      commentCount
    }
  }
`;

const MODERATE_POST = gql`
  mutation moderatePost($postId: String!, $decision: String!, $reason: String) {
    moderatePost(postId: $postId, decision: $decision, reason: $reason) {
      _id
      status
      moderationNote
    }
  }
`;

const GET_USERS = gql`
  query getUsers {
    getUsers {
      _id
      name
      email
      telephone
      isAdmin
      isDeleted
      lastVisit
      createdAt
    }
  }
`;

const DELETE_USERS = gql`
  mutation deleteUsers($userIds: [ID!]!, $mode: UserDeletionMode!) {
    deleteUsers(userIds: $userIds, mode: $mode)
  }
`;

const AdminPage = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const [previewPostId, setPreviewPostId] = useState(null);
  const { data: meData, loading: meLoading } = useQuery(GET_ME, { skip: !isLoggedIn });
  const { data, loading, error, refetch } = useQuery(GET_PENDING_POSTS, { skip: !isLoggedIn });
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS, { skip: !isLoggedIn });
  const [moderatePost] = useMutation(MODERATE_POST);
  const [deleteUsers, { loading: deletingUsers }] = useMutation(DELETE_USERS);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  if (!isLoggedIn) return <p>Требуется авторизация.</p>;
  if (meLoading) return <p>Загрузка профиля...</p>;
  if (!meData?.me?.isAdmin) return <p>Только администратор может открыть эту страницу.</p>;
  if (loading) return <p>Загрузка заявок...</p>;
  if (error) {
    console.error('Admin pending posts error:', error);
    return <p>Ошибка загрузки заявок: {error.message}</p>;
  }

  const pendingPosts = data?.getPendingPosts || [];
  const users = usersData?.getUsers || [];
  const deletableUsers = users.filter(item => item._id !== meData.me._id);
  const hasDeletedSelected = users.some(item => selectedUserIds.includes(item._id) && item.isDeleted);

  const handleDecision = async (postId, decision) => {
    const reason = window.prompt(decision === 'approve' ? 'Комментарий к решению (необязательно)' : 'Причина отказа');
    await moderatePost({ variables: { postId, decision, reason: reason || null } });
    refetch();
  };

  const toggleUser = userId => {
    setSelectedUserIds(current => current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId]);
  };

  const toggleAllUsers = event => {
    setSelectedUserIds(event.target.checked ? deletableUsers.map(item => item._id) : []);
  };

  const handleDeleteUsers = async mode => {
    if (!selectedUserIds.length) return;
    const title = mode === 'CONTENT'
      ? `Удалить выбранных пользователей вместе со всем контентом (${selectedUserIds.length})?`
      : `Удалить только данные выбранных пользователей (${selectedUserIds.length})?`;
    if (!window.confirm(`${title} Это действие нельзя отменить.`)) return;
    await deleteUsers({ variables: { userIds: selectedUserIds, mode } });
    setSelectedUserIds([]);
    await refetchUsers();
  };

  return (
    <div className="admin-page">
      <h1>Панель модерации</h1>
      <p>Здесь администратор может одобрить или отклонить новые записи пользователей.</p>
      <section className="admin-users-section">
        <h2>Зарегистрированные пользователи</h2>
        {usersLoading ? <p>Загрузка пользователей...</p> : usersError ? <p>Ошибка загрузки пользователей: {usersError.message}</p> : (
          <>
            <div className="admin-users-toolbar">
              <label>
                <input
                  type="checkbox"
                  checked={deletableUsers.length > 0 && selectedUserIds.length === deletableUsers.length}
                  onChange={toggleAllUsers}
                />
                Выбрать всех
              </label>
              <div className="admin-delete-actions">
                <button type="button" className="admin-delete-button admin-delete-data-button" disabled={!selectedUserIds.length || hasDeletedSelected || deletingUsers} onClick={() => handleDeleteUsers('USER_DATA')}>
                  {deletingUsers ? 'Удаление...' : `Удалить только данные (${selectedUserIds.length})`}
                </button>
                <button type="button" className="admin-delete-button" disabled={!selectedUserIds.length || deletingUsers} onClick={() => handleDeleteUsers('CONTENT')}>
                  {deletingUsers ? 'Удаление...' : `Удалить с контентом (${selectedUserIds.length})`}
                </button>
              </div>
            </div>
            {users.length === 0 ? <p>Пользователей нет.</p> : (
              <div className="admin-users-table-wrap">
                <table className="admin-users-table">
                  <thead><tr><th></th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Регистрация</th></tr></thead>
                  <tbody>{users.map(item => {
                    const isCurrentUser = item._id === meData.me._id;
                    return <tr key={item._id}>
                      <td><input type="checkbox" disabled={isCurrentUser} checked={selectedUserIds.includes(item._id)} onChange={() => toggleUser(item._id)} /></td>
                      <td>{item.name}{isCurrentUser ? ' (вы)' : ''}</td>
                      <td>{item.email}</td>
                      <td>{item.telephone || '—'}</td>
                      <td>{item.isDeleted ? 'Удален' : item.isAdmin ? 'Администратор' : 'Пользователь'}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
      {pendingPosts.length === 0 ? (
        <p>Нет заявок на публикацию.</p>
      ) : (
        <ul className="pending-posts-list">
          {pendingPosts.map(post => (
            <li key={post._id} className="pending-post-item">
              <h1>{post.title}</h1>
              <div className="admin-post-info">
              <div>Автор: {post.author?.name || 'Неизвестно'}</div>
              <div>Раздел: {post.category?.catname || '—'}</div>
              <div>Дата: {new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <div className='admin-body'>{post.body?.slice(0, 220)}{post.body?.length > 220 ? '…' : ''}</div>
              <div className="admin-buttons" >
                <button onClick={() => setPreviewPostId(previewPostId === post._id ? null : post._id)} style={{ marginRight: '0.6rem' }}>
                  {previewPostId === post._id ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}
                </button>
                <button onClick={() => handleDecision(post._id, 'approve')} style={{ marginRight: '0.6rem' }}>Одобрить</button>
                <button onClick={() => handleDecision(post._id, 'reject')}>Отклонить</button>
              </div>
              {previewPostId === post._id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <Post post={post} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPage;
