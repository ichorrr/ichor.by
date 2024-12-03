import React, { useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';

const Comments = props =>  {
    const [comments, setComments] = useState({comments: props.comment || ''});
return (
    <div className='comment-block'>
        <h3>Комментарии к записи</h3>
        <textarea>Текст комментария</textarea>
        <button>Опубликовать</button>
    </div>
)
};

export default Comments;

