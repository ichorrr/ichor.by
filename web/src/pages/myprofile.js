import React, { useEffect, useMemo, useState } from 'react';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const categories = useMemo(() => {
    const map = new Map();
    posts.forEach(p => {
      const cat = p?.category;
      const id = cat?._id || 'nocat';
      const name = cat?.catname || 'Без категории';
      if (map.has(id)) {
        map.get(id).count += 1;
      } else {
        map.set(id, { id, name, count: 1 });
      }
    });
    return [{ id: 'all', name: 'Все', count: posts.length }, ...Array.from(map.values())];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts
      .filter(post => {
        if (selectedCategoryId !== 'all' && post.category?._id !== selectedCategoryId) {
          return false;
        }
        if (!query) return true;
        const text = [post.title, post.body, post.body2, post.body3, post.category?.catname, ...(post.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return text.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const aRating = (a.likesCount || 0) - (a.dislikesCount || 0);
          const bRating = (b.likesCount || 0) - (b.dislikesCount || 0);
          return bRating - aRating;
        }
        if (sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (sortBy === 'comments') {
          return (b.commentCount || 0) - (a.commentCount || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [posts, selectedCategoryId, searchQuery, sortBy]);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

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
          <div className="search-sort-controls">
            <input
              type="text"
              placeholder="Поиск по моим заметкам"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date">По дате</option>
              <option value="rating">По рейтингу</option>
              <option value="views">По просмотрам</option>
              <option value="comments">По комментариям</option>
            </select>
          </div>
          {categories.length > 0 && (
            <div className="my-categories" style={{ marginBottom: 12 }}>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {categories.map(c => (
                  <li
                    key={c.id}
                    className={selectedCategoryId === c.id ? 'active' : ''}
                    onClick={() => setSelectedCategoryId(c.id)}
                  >
                    <span>{c.name}</span> <small>({c.count})</small>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MyPosts posts={filteredPosts} userName={me.name} />
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
                <div className="comment-date">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
              </div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-post">
                <a href={`/posts/${c.post?._id}`} className="comment-post-link">
                  {c.post?.title || '—'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );};

export default MyProf;
