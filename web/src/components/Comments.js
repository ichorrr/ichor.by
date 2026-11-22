import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import DeleteComm from './DeleteComm.js';
import CommentCount from './CommentCount';
import LikeDislike from './LikeDislike';

const Comments = props =>  {
    const [text, setText] = useState("");

    const currentUser = props.me?.me;
    const isSubmitting = Boolean(props.isSubmitting);
    
    const onChangeHandler = (e) => {
        setText(e.target.value);
      };
     
      const tkn = {
        isLoggedIn: !!localStorage.getItem('token')
      };    

      console.log(tkn);
      console.log(props.post);
      const postcom = props.post?.comments || [];
      console.log(postcom);

return (
    <div className='comments-block'>
      {currentUser && (
        <div className='form-comment'>
          
          
          <CommentCount count={props.post.commentCount || postcom.length} text="всего {count} комментариев" className="length-comments" />
          <form onSubmit={event => {
            event.preventDefault();
            if (!text.trim() || isSubmitting) return;
            props.action({
              variables: {
                text: text.trim(),
                post: props.post._id
              }
            });
          }}>
          <textarea value={text} onChange={onChangeHandler} disabled={isSubmitting} placeholder="Добавить комментарий..." />
          <button type="submit" disabled={isSubmitting || !text.trim()}>
            {isSubmitting ? 'Загрузка...' : 'Опубликовать'}
          </button>
          </form>
        </div>
        )}
        

        <h3 className='comment-name'>Комментарии</h3>
        {postcom.map(({_id, text, createdAt, author, likesCount = 0, dislikesCount = 0}) => (
              <div key={_id} id={`comment-${_id}`} className='comment-block'>
                <div>
                  <span className='author-comment'>{author?.name || 'Пользователь'}</span>
                  <span>{format(new Date(createdAt), 'dd LLL yyyy  HH:mm')}</span>
                </div>
                <p>{text}</p>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <LikeDislike
                    targetId={_id}
                    type="comment"
                    initialLikes={likesCount}
                    initialDislikes={dislikesCount}
                    isAuthenticated={!!currentUser}
                  />
                  {currentUser?._id && author?._id && currentUser._id === author._id && (
                    <DeleteComm id={_id} />
                  )}
                </div>
              </div>
        ))}
    </div>
)};

export default Comments;