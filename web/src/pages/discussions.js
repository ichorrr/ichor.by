import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { GET_ME } from '../gql/query';

const DISCUSSIONS = gql`
  query MyDiscussions {
    getMyGroupChats {
      _id
      title
      topic
      category
      type
      post { _id title }
      owner { name }
      updatedAt
    }
    getMyChatInvitations {
      _id
      title
      topic
      owner { name }
    }
  }
`;

const CREATE_TOPIC_CHAT = gql`
  mutation CreateTopicChat($title: String!, $topic: String!, $invitees: [ID!]!) {
    createTopicChat(title: $title, topic: $topic, invitees: $invitees) {
      _id
    }
  }
`;

const RESPOND_TO_INVITATION = gql`
  mutation RespondToChatInvitation($chatId: ID!, $accept: Boolean!) {
    respondToChatInvitation(chatId: $chatId, accept: $accept) {
      _id
    }
  }
`;

const DiscussionsPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [formError, setFormError] = useState('');
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data, loading, error, refetch } = useQuery(DISCUSSIONS, { fetchPolicy: 'cache-and-network' });
  const [createTopicChat, { loading: creating }] = useMutation(CREATE_TOPIC_CHAT, {
    onCompleted: result => {
      setTitle('');
      setTopic('');
      setSelectedFriends([]);
      setFormError('');
      refetch();
      navigate(`/chat/${result.createTopicChat._id}`);
    },
    onError: mutationError => setFormError(mutationError.message)
  });
  const [respondToInvitation] = useMutation(RESPOND_TO_INVITATION, {
    onCompleted: () => refetch(),
    onError: mutationError => setFormError(mutationError.message)
  });

  const friends = userData?.me?.family || [];
  const toggleFriend = id => setSelectedFriends(current =>
    current.includes(id) ? current.filter(friendId => friendId !== id) : [...current, id]
  );
  const submit = event => {
    event.preventDefault();
    setFormError('');
    createTopicChat({ variables: { title, topic, invitees: selectedFriends } });
  };

  if (loading || userLoading) return <p>Загрузка обсуждений…</p>;
  if (error) return <p role="alert">Не удалось загрузить обсуждения: {error.message}</p>;

  return (
    <main style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <h1>Обсуждения</h1>
      <p>Обсуждения статей и тематические чаты собраны в отдельном разделе.</p>

      <section>
        <h2>Приглашения</h2>
        {(data?.getMyChatInvitations || []).length === 0 && <p>Новых приглашений нет.</p>}
        {(data?.getMyChatInvitations || []).map(chat => (
          <article key={chat._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <strong>{chat.title}</strong>
            <p>{chat.topic} · Пригласил(а): {chat.owner?.name || 'пользователь'}</p>
            <button type="button" onClick={() => respondToInvitation({ variables: { chatId: chat._id, accept: true } })}>Принять</button>
            <button type="button" onClick={() => respondToInvitation({ variables: { chatId: chat._id, accept: false } })}>Отклонить</button>
          </article>
        ))}
      </section>

      <section>
        <h2>Мои чаты</h2>
        {(data?.getMyGroupChats || []).length === 0 && <p>Вы пока не участвуете в обсуждениях.</p>}
        {(data?.getMyGroupChats || []).map(chat => (
          <article key={chat._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <Link to={`/chat/${chat._id}`}><strong>{chat.title}</strong></Link>
            <p>{chat.category}{chat.topic ? ` · ${chat.topic}` : ''}</p>
            {chat.post && <Link to={`/posts/${chat.post._id}`}>К материалу: {chat.post.title}</Link>}
          </article>
        ))}
      </section>

      <section>
        <h2>Создать тематический чат</h2>
        <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
          <label>
            Название
            <input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} />
          </label>
          <label>
            Тема обсуждения
            <textarea required maxLength={200} value={topic} onChange={event => setTopic(event.target.value)} />
          </label>
          <fieldset>
            <legend>Пригласить друзей (до 30)</legend>
            {friends.map(friend => (
              <label key={friend._id} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend._id)}
                  onChange={() => toggleFriend(friend._id)}
                  disabled={!selectedFriends.includes(friend._id) && selectedFriends.length >= 30}
                />
                {friend.name}
              </label>
            ))}
            {friends.length === 0 && <p>Сначала начните переписку с друзьями, чтобы добавить их в список.</p>}
          </fieldset>
          <button type="submit" disabled={creating}>Создать чат и отправить приглашения</button>
          {formError && <p role="alert">{formError}</p>}
        </form>
      </section>
    </main>
  );
};

export default DiscussionsPage;
