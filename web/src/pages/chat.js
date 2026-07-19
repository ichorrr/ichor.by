import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Messages from '../components/Messages';
import { useQuery } from '@apollo/client';
import ListMyUserChats from '../components/ListMyUserChats';
import { GET_ME } from '../gql/query';

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCompactView, setIsCompactView] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 920 : false));
  const [showChat, setShowChat] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 920 : true));

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth <= 920;
      setIsCompactView(compact);
      if (!compact) {
        setShowChat(true);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { loading, error, data } = useQuery(GET_ME, {
    onError: (error) => {
      console.error('Error fetching user data:', error);
      navigate('/login');
    }
  });

  const nameChatId = useMemo(() => {
    if (!data?.me?.family) return 'Unknown';
    return data.me.family.find(fam => fam._id === id)?.name || 'Unknown';
  }, [data?.me?.family, id]);

  useEffect(() => {
    document.title = `Чат с ${nameChatId} > ichor.by`;
  }, [nameChatId]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error fetching user data:', error);
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="chat-container">
      {isCompactView ? (
        <div className="chat-mobile-shell">
          <div className={`chat-mobile-list ${showChat ? 'hidden' : ''}`}>
            <ListMyUserChats compactMode onSelectChat={() => setShowChat(true)} />
          </div>
          {showChat ? (
            <div className="chat-mobile-panel">
              <Messages
                nameChatId={nameChatId}
                mem={id}
                myId={data.me._id}
                onBack={() => setShowChat(false)}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="user-chats">
            <ListMyUserChats />
          </div>
          <div className="messages">
            <Messages nameChatId={nameChatId} mem={id} myId={data.me._id} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
