import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Link, useNavigate, useParams } from 'react-router-dom';

const GROUPS_AND_INVITATIONS = gql`
  query ChatGroupsAndInvitations {
    getMyGroupChats {
      _id
      title
      topic
      category
      post { _id title }
    }
    getMyChatInvitations {
      _id
      title
      topic
      owner { name }
    }
    me {
      family { _id name }
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

const GroupDiscussions = () => {
  const navigate = useNavigate();
  const { id: activeChatId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [formError, setFormError] = useState('');
  const { data, loading, error, refetch } = useQuery(GROUPS_AND_INVITATIONS, {
    fetchPolicy: 'cache-and-network'
  });
  const [createTopicChat, { loading: creating }] = useMutation(CREATE_TOPIC_CHAT, {
    onError: mutationError => setFormError(mutationError.message)
  });
  const [respondToInvitation, { loading: responding }] = useMutation(RESPOND_TO_INVITATION, {
    onError: mutationError => setFormError(mutationError.message)
  });

  const groups = data?.getMyGroupChats || [];
  const invitations = data?.getMyChatInvitations || [];
  const friends = data?.me?.family || [];

  React.useEffect(() => {
    const refreshGroups = () => {
      refetch().catch(refetchError => {
        console.error('Unable to refresh chat groups:', refetchError);
      });
    };
    window.addEventListener('reloadChats', refreshGroups);
    return () => window.removeEventListener('reloadChats', refreshGroups);
  }, [refetch]);

  const toggleFriend = friendId => {
    setSelectedFriends(current =>
      current.includes(friendId)
        ? current.filter(id => id !== friendId)
        : current.length < 30 ? [...current, friendId] : current
    );
  };

  const submit = async event => {
    event.preventDefault();
    setFormError('');
    try {
      const result = await createTopicChat({
        variables: { title: title.trim(), topic: topic.trim(), invitees: selectedFriends }
      });
      setTitle('');
      setTopic('');
      setSelectedFriends([]);
      setIsCreating(false);
      navigate(`/chat/${result.data.createTopicChat._id}`);
      refetch().catch(refetchError => {
        console.error('Unable to refresh chat groups:', refetchError);
      });
    } catch (mutationError) {
      console.error('Unable to create topic chat:', mutationError);
    }
  };

  const respond = async (chatId, accept) => {
    setFormError('');
    try {
      await respondToInvitation({ variables: { chatId, accept } });
      if (accept) navigate(`/chat/${chatId}`);
      refetch().catch(refetchError => {
        console.error('Unable to refresh chat groups:', refetchError);
      });
    } catch (mutationError) {
      console.error('Unable to respond to chat invitation:', mutationError);
    }
  };

  return (
    <section className="profile-discussions">
      <header className="profile-discussions__header">
        <h3>Тематические группы</h3>
        <button
          type="button"
          className="profile-discussions__create-toggle"
          onClick={() => {
            setIsCreating(open => !open);
            setFormError('');
          }}
          aria-expanded={isCreating}
        >
          {isCreating ? 'Отмена' : '＋ Создать'}
        </button>
      </header>

      {error && <p className="profile-discussions__error" role="alert">Не удалось загрузить группы: {error.message}</p>}
      {loading && !data && <p className="profile-discussions__message">Загружаем группы…</p>}

      {invitations.length > 0 && (
        <div className="profile-discussions__invitations">
          <strong>Приглашения</strong>
          {invitations.map(invitation => (
            <div className="profile-discussions__invitation" key={invitation._id}>
              <span>{invitation.title} · {invitation.owner?.name || 'Пользователь'}</span>
              <div>
                <button type="button" disabled={responding} onClick={() => respond(invitation._id, true)}>Принять</button>
                <button type="button" disabled={responding} onClick={() => respond(invitation._id, false)}>Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="profile-discussions__list">
        {groups.map(group => (
          <Link
            key={group._id}
            to={`/chat/${group._id}`}
            className={`profile-discussions__item ${activeChatId === group._id ? 'is-active' : ''}`}
          >
            <strong>{group.title || group.post?.title || 'Обсуждение'}</strong>
            <span>{group.post ? 'Обсуждение материала' : group.topic || group.category}</span>
          </Link>
        ))}
        {!loading && !error && groups.length === 0 && invitations.length === 0 && (
          <p className="profile-discussions__message">Создайте тематическую группу или примите приглашение.</p>
        )}
      </div>

      {isCreating && (
        <form className="profile-discussions__form" onSubmit={submit}>
          <label>
            Название группы
            <input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} />
          </label>
          <label>
            Тема обсуждения
            <textarea required maxLength={200} value={topic} onChange={event => setTopic(event.target.value)} />
          </label>
          <fieldset>
            <legend>Пригласить друзей (до 30)</legend>
            {friends.map(friend => (
              <label key={friend._id}>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend._id)}
                  onChange={() => toggleFriend(friend._id)}
                />
                {friend.name}
              </label>
            ))}
            {friends.length === 0 && <p>Пока нет пользователей в списке личных чатов.</p>}
          </fieldset>
          {formError && <p className="profile-discussions__error" role="alert">{formError}</p>}
          <button type="submit" disabled={creating}>Создать группу</button>
        </form>
      )}
    </section>
  );
};

export default GroupDiscussions;
