import React, { useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';

const Comments = props =>  {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    
    const onClickHandler = () => {
        setComments((comments) => [...comments, comment])
    }
    
    const onChangeHandler = (e) => {
        setComment(e.target.value);
      };


return (
    <div className='comments-block'>
        {comments.map((text) => (
            <div className='comment-block'>{text}</div>    
        ))}
        <h3>Комментарии к записи</h3>

        <textarea value={comment} onChange={onChangeHandler}>Текст комментария</textarea>
        <button onClick={onClickHandler}>Опубликовать</button>
    </div>
)
};

export default Comments;

