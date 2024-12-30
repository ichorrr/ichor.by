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
      const postcom = props.post.comments;
      console.log(postcom);
      console.log(postcom[0].author)

return (
    <div className='comments-block'>
        {postcom.map(({_id, text, createdAt}) => (
            
            <div key={_id} className='comment-block'  >
              <div><h3>postcom</h3><p>{createdAt}</p></div>
              {text}
              </div>    
        ))}
        <h3>Комментарии к записи</h3>
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
        <textarea value={text} onChange={onChangeHandler}>Текст комментария</textarea>
        <button type="submit"  value={comments} onClick={onClickHandler}>Опубликовать</button>
    
        </form>

    </div>
)
};

export default Comments;

