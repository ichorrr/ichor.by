import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Messages from '../components/Messages';
import { gql, useQuery } from '@apollo/client';
import ListMyUserChats from '../components/ListMyUserChats';
import { GET_CHAT_USER } from '../gql/query';
import GroupChatPage from './group-chat';

const GROUP_CHAT_EXISTS = gql`
  query GroupChatExists($id: ID!) {
    getGroupChat(_id: $id) { _id }
  }
`;

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCompactView, setIsCompactView] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 920 : false));
  const [showChat, setShowChat] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 920 : true));

  useEffect(() => {
    setShowChat(Boolean(id));
  }, [id]);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth <= 920;
      setIsCompactView(compact);
      setShowChat(!compact || Boolean(id));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [id]);

  const { loading, error, data } = useQuery(GET_CHAT_USER, { fetchPolicy: 'network-only' });
  const { data: groupData, loading: groupLoading, error: groupError } = useQuery(GROUP_CHAT_EXISTS, {
    variables: { id },
    fetchPolicy: 'network-only',
    skip: !data?.me || !id
  });

  const nameChatId = useMemo(() => {
    if (!data?.me?.family) return 'Unknown';
    return data.me.family.find(fam => fam._id === id)?.name || 'Unknown';
  }, [data?.me?.family, id]);

  useEffect(() => {
    document.title = id ? `Чат с ${nameChatId} > ichor.by` : 'Чаты > ichor.by';
  }, [id, nameChatId]);

  if (loading || (data?.me && id && groupLoading)) return <p>Загрузка чата…</p>;
  if (error) {
    console.error('Error fetching user data:', error);
    return <p role="alert">Не удалось загрузить профиль для чата: {error.message}</p>;
  }
  if (!data?.me) return <p>Требуется авторизация.</p>;
  if (groupError) {
    console.error('Error checking group discussion:', groupError);
    return <p role="alert">Не удалось проверить обсуждение: {groupError.message}</p>;
  }
  const isGroupChat = Boolean(groupData?.getGroupChat);
  const openChat = selectedId => {
    navigate(`/chat/${selectedId}`);
    setShowChat(true);
  };
  const closeChat = () => {
    setShowChat(false);
    navigate('/chat');
  };

  return (
    <div className="chat-container chat-unified-layout">
      {isCompactView ? (
        <div className="chat-mobile-shell">
          <div className={`chat-mobile-list chat-unified-list ${showChat ? 'hidden' : ''}`}>
            <ListMyUserChats compactMode onSelectChat={openChat} />
          </div>
          {showChat ? (
            <div className="chat-mobile-panel">
              {isGroupChat ? (
                <GroupChatPage chatId={id} onBack={closeChat} />
              ) : id ? (
                <Messages nameChatId={nameChatId} mem={id} myId={data.me._id} onBack={closeChat} />
              ) : (
                <div className="chat-unified-empty">Выберите личный чат или тематическую группу.</div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <aside className="chat-unified-list">
            <ListMyUserChats />
          </aside>
          <section className="chat-unified-panel">
            {isGroupChat ? (
              <GroupChatPage chatId={id} onBack={closeChat} />
            ) : id ? (
              <Messages nameChatId={nameChatId} mem={id} myId={data.me._id} onBack={closeChat} />
            ) : (
              <div className="chat-unified-empty">Выберите личный чат или тематическую группу.</div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ChatPage;
