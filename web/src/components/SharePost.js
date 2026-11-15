import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const SHARE_FRIENDS = gql`
  query ShareFriends {
    me {
      family { _id name }
    }
  }
`;

const SHARE_POST = gql`
  mutation SharePost($text: String!, $addressee: String!) {
    createMessage(text: $text, addressee: $addressee) {
      _id
    }
  }
`;

const SharePost = ({ post }) => {
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [feedback, setFeedback] = useState('');
  const { data, loading } = useQuery(SHARE_FRIENDS, { skip: !open });
  const navigate = useNavigate();
  const [sharePost, { loading: sending }] = useMutation(SHARE_POST, {
    onCompleted: () => setFeedback('Ссылка отправлена.')
  });

  const openDialog = () => {
    if (!localStorage.getItem('token')) {
      navigate('/signin');
      return;
    }
    setFeedback('');
    setOpen(true);
  };

  const send = async event => {
    event.preventDefault();
    if (!friendId) return;
    const url = `${window.location.origin}/posts/${post._id}`;
    try {
      await sharePost({
        variables: {
          addressee: friendId,
          text: `Делюсь материалом «${post.title}»: ${url}`
        }
      });
    } catch (error) {
      setFeedback(`Не удалось отправить ссылку: ${error.message}`);
    }
  };

  return (
    <>
      <button type="button" className="post-actions__share" onClick={openDialog}>Поделиться с друзьями</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={`share-title-${post._id}`} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <form onSubmit={send} style={{ background: '#fff', borderRadius: 10, padding: 20, width: 'min(420px, 100%)' }}>
            <h2 id={`share-title-${post._id}`}>Поделиться материалом</h2>
            {loading ? <p>Загружаем друзей…</p> : (
              <label>
                Выберите друга
                <select required value={friendId} onChange={event => setFriendId(event.target.value)}>
                  <option value="">Выберите…</option>
                  {(data?.me?.family || []).map(friend => <option key={friend._id} value={friend._id}>{friend.name}</option>)}
                </select>
              </label>
            )}
            {(data?.me?.family || []).length === 0 && !loading && <p>Список друзей пока пуст.</p>}
            {feedback && <p role="status">{feedback}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" disabled={!friendId || sending || loading}>Отправить</button>
              <button type="button" onClick={() => setOpen(false)}>Закрыть</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SharePost;
