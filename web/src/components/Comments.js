import React, { useState } from 'react';

const Comments = props =>  {
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    const onClickHandler = () => {
        setComments((comments) => [...comments, text])
    }
    
    const onChangeHandler = (e) => {
        setText(e.target.value);
      };

      
      console.log(text);
      console.log(props.post);
      const postcom = props.post;

return (
    <div className='comments-block'>
        {postcom.comments.map(({text}) => (
            <div className='comment-block'  >{text}</div>    
        ))}
        <h3>Комментарии к записи</h3>
        <span>всего  комментариев</span>

        <form onSubmit={event => {
          event.preventDefault();

          props.action({
            variables: {
              text,
              post: props.post._id
            }
          });
        }}>
        <textarea value={text} onChange={onChangeHandler}>Текст комментария</textarea>
        <button type="submit"  value={comments} onClick={onClickHandler}>Опубликовать</button>
    
        </form>

    </div>
)
};

export default Comments;

