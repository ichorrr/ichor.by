import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_ME } from '../gql/query';
import Post from '../components/Post';

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

const AdminPage = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const [previewPostId, setPreviewPostId] = useState(null);
  const { data: meData, loading: meLoading } = useQuery(GET_ME, { skip: !isLoggedIn });
  const { data, loading, error, refetch } = useQuery(GET_PENDING_POSTS, { skip: !isLoggedIn });
  const [moderatePost] = useMutation(MODERATE_POST);

  if (!isLoggedIn) return <p>Требуется авторизация.</p>;
  if (meLoading) return <p>Загрузка профиля...</p>;
  if (!meData?.me?.isAdmin) return <p>Только администратор может открыть эту страницу.</p>;
  if (loading) return <p>Загрузка заявок...</p>;
  if (error) {
    console.error('Admin pending posts error:', error);
    return <p>Ошибка загрузки заявок: {error.message}</p>;
  }

  const pendingPosts = data?.getPendingPosts || [];

  const handleDecision = async (postId, decision) => {
    const reason = window.prompt(decision === 'approve' ? 'Комментарий к решению (необязательно)' : 'Причина отказа');
    await moderatePost({ variables: { postId, decision, reason: reason || null } });
    refetch();
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Панель модерации</h1>
      <p>Здесь администратор может одобрить или отклонить новые записи пользователей.</p>
      {pendingPosts.length === 0 ? (
        <p>Нет заявок на публикацию.</p>
      ) : (
        <ul>
          {pendingPosts.map(post => (
            <li key={post._id} style={{ marginBottom: '1.2rem', listStyle: 'none', border: '1px solid #ddd', padding: '1rem', borderRadius: 8 }}>
              <strong>{post.title}</strong>
              <div>Автор: {post.author?.name || 'Неизвестно'}</div>
              <div>Раздел: {post.category?.catname || '—'}</div>
              <div>Дата: {new Date(post.createdAt).toLocaleString()}</div>
              <div style={{ marginTop: '0.5rem' }}>{post.body?.slice(0, 220)}{post.body?.length > 220 ? '…' : ''}</div>
              <div style={{ marginTop: '0.8rem' }}>
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
