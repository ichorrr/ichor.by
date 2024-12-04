import React, { useState } from 'react';

import { useQuery } from '@apollo/client';
import { GET_POST } from '../gql/query';

const Comments = props =>  {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const id = props.post;
    const { loading, error, data } = useQuery(GET_POST, { variables: { id },

        refetchQueries: [{query: GET_POST }]} );
        {console.log(data.getPost.comments.length)}

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
        <span>всего {data.getPost.comments.length} комментариев</span>

        <textarea value={comments.props} onChange={onChangeHandler}>Текст комментария</textarea>
        <button onClick={onClickHandler}>Опубликовать</button>
    </div>
)
};

export default Comments;

