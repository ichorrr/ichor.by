import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import DeleteComm from './DeleteComm.js';

const Comments = props =>  {
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    const onClickHandler = () => {
        setComments((comments) => [...comments, text])
    }
    
    const onChangeHandler = (e) => {
        setText(e.target.value);
      };
     
      const tkn = {
        isLoggedIn: !!localStorage.getItem('token')
      };    

      console.log(tkn);
      console.log(props.post);
      const postcom = props.post.comments;
      console.log(postcom);

return (
    <div className='comments-block'>
      {props.me && (
        <div className='form-comment'>
          
          
          <span className='length-comments'>всего {postcom.length} комментариев</span>
          <form onSubmit={event => {
            event.preventDefault();
            props.action({
              variables: {
                text,
                post: props.post._id
              }
            });
          }}>
          <textarea value={text} onChange={onChangeHandler}  placeholder="Добавить комментарий...">Текст комментария</textarea>
          <button type="submit"  value={comments} onClick={onClickHandler}>Опубликовать</button>
          </form>
        </div>
        )}
        

        {postcom.map(({_id, text, createdAt, author}) => (
              <>
              <h3 className='comment-name'>Комментарии</h3>
              <div key={_id} className='comment-block'  >
              <div><span className='author-comment'>{author.name}</span><span>{format(new Date(createdAt), 'dd LLL yyyy  HH:mm')}</span></div>
              <p>{text}</p>
              
              {props.me && props.me.me._id === author._id && (
              <DeleteComm id={_id}/>
    )}
            
              </div>
              </>
        ))}
    </div>
)};

export default Comments;