import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../gql/query';
import MyPosts from '../components/MyPosts';
import ListMyUserChats from '../components/ListMyUserChats';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';

const containerStyle = {
  display: 'flex',
  gap: 20,
  alignItems: 'flex-start',
  padding: '18px',
  boxSizing: 'border-box'
};
const leftStyle = { width: 340, top: 90, position: 'sticky' };
const centerStyle = { paddingTop: 72 };
const rightStyle = { width: 320, top: 90, position: 'sticky' };
const card = { background: '#fff',  borderRadius: 8,  padding: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' };
  
const MyProf = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'MY PROFILE - ICHOR.BY';
  }, []);

  const { loading, error, data } = useQuery(GET_ME, { fetchPolicy: 'network-only' });

  const me = data?.me || {};
  const posts = me.posts || [];
  const comments = useMemo(() => (Array.isArray(me.comments) ? [...me.comments].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6) : []), [me.comments]);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  console.log('MyProf comments:', data.me);

  return (
    <div style={containerStyle}>
      <aside style={leftStyle}>
        <div style={card}>
          <h3 style={{marginTop:0}}>Чаты</h3>
          <ListMyUserChats />
        </div>
      </aside>

      <section style={centerStyle}>
        <div style={card}>
          <h2>Мои записи</h2>
          <MyPosts posts={me} />
        </div>
      </section>

      <aside style={rightStyle}>
        <div style={card} className="right-comments">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Последние комментарии</h3>
            <button
              onClick={() => navigate('/settings')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: 'none',
                background: '#159dc3',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              settings
            </button>
          </div>

          {comments.length === 0 && <div className="no-comments">Нет комментариев</div>}

          {comments.map((c, idx) => (
            <div key={c._id} className="comment-item">
              <div className="comment-head">
                <div className="comment-author">{c.author?.name || '—'}</div>
                <div className="comment-date">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );};

export default MyProf;
