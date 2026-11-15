import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import GroupGames from '../components/GroupGames';

const CURRENT_USER = gql`
  query CurrentGroupChatUser {
    me { _id isAdmin }
  }
`;

const GROUP_CHAT = gql`
  query GroupChat($id: ID!) {
    getGroupChat(_id: $id) {
      _id
      title
      topic
      category
      participants { _id name avatar }
      post { _id title }
      messages {
        _id
        text
        createdAt
        author { _id name }
      }
    }
  }
`;

const SEND_GROUP_MESSAGE = gql`
  mutation SendGroupMessage($chatId: ID!, $text: String!) {
    createMessage(chatId: $chatId, text: $text) {
      _id
      text
      createdAt
      author { _id name }
    }
  }
`;

const GroupChatPage = ({ chatId, onBack }) => {
  const id = chatId;
  const [text, setText] = useState('');
  const [showGames, setShowGames] = useState(true);
  const { data: currentUserData } = useQuery(CURRENT_USER);
  const { data, loading, error, refetch } = useQuery(GROUP_CHAT, {
    variables: { id },
    fetchPolicy: 'network-only',
    pollInterval: 5000
  });
  const [sendMessage, { loading: sending, error: sendError }] = useMutation(SEND_GROUP_MESSAGE, {
    onCompleted: () => {
      setText('');
      refetch();
      window.dispatchEvent(new Event('reloadChats'));
    }
  });
  const chat = data?.getGroupChat;

  useEffect(() => {
    if (chat?.title) document.title = `${chat.title} > ichor.by`;
  }, [chat?.title]);

  const submit = async event => {
    event.preventDefault();
    const message = text.trim();
    if (!message) return;
    try {
      await sendMessage({ variables: { chatId: id, text: message } });
    } catch (sendError) {
      console.error('Unable to send group message:', sendError);
    }
  };

  if (loading) return <p>Загрузка чата…</p>;
  if (error) return <p role="alert">Не удалось открыть чат: {error.message}</p>;
  if (!chat) return <p>Чат не найден или у вас нет доступа.</p>;

  return (
    <section className="group-chat-panel">
      <header className="group-chat-panel__header">
        {onBack && <button type="button" className="group-chat-panel__back" onClick={onBack}>← Чаты</button>}
        <div className="group-chat-panel__header-info">
          <h1>{chat.title}</h1>
          <p>{chat.category}{chat.topic ? ` · ${chat.topic}` : ''}</p>
          {chat.post && <p className="group-chat-panel__post">Материал: {chat.post.title}</p>}
          <p className="group-chat-panel__participants">Участники: {chat.participants.map(person => person.name).join(', ')}</p>
        </div>
        {currentUserData?.me?._id && (
          <button
            type="button"
            className="rButMenu group-chat-panel__games-toggle"
            aria-expanded={showGames}
            aria-controls="group-chat-games"
            onClick={() => setShowGames(visible => !visible)}
          >
            {showGames ? 'Скрыть игры' : 'Показать игры'}
          </button>
        )}
      </header>
      <div className="group-chat-panel__body">
        <div className="group-chat-panel__conversation">
          <section className="group-chat-panel__messages" aria-live="polite">
            {chat.messages.length === 0 && <p>Начните обсуждение этой темы.</p>}
            {chat.messages.map(message => (
              <article key={message._id} className="group-chat-panel__message">
                <strong>{message.author?.name || 'Пользователь'}</strong>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
              </article>
            ))}
          </section>
          <form className="group-chat-panel__form" onSubmit={submit}>
            <input
              aria-label="Сообщение"
              value={text}
              onChange={event => setText(event.target.value)}
              maxLength={5000}
              placeholder="Напишите сообщение…"
            />
            <button type="submit" disabled={sending || !text.trim()}>Отправить</button>
          </form>
          {sendError && <p role="alert">Не удалось отправить сообщение: {sendError.message}</p>}
        </div>
        {showGames && currentUserData?.me?._id && (
          <aside className="group-chat-panel__games-column" id="group-chat-games" aria-label="Игры в чате">
            <GroupGames
              chatId={chat._id}
              participants={chat.participants}
              myId={currentUserData.me._id}
              isAdmin={currentUserData.me.isAdmin}
            />
          </aside>
        )}
      </div>
    </section>
  );
};

export default GroupChatPage;
