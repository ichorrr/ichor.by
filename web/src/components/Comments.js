import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { GET_COMMENTS } from '../gql/query';

const Comments = props =>  {
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    const { data, loading, error } = useQuery(GET_COMMENTS, {
      variables: {
        post: props.post._id
      },
    });
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;

    const onClickHandler = () => {
        setComments((comments) => [...comments, text])
    }
    
    const onChangeHandler = (e) => {
        setText(e.target.value);
      };

<<<<<<< HEAD
      const postcom = props.post;
      const arrcom = data.getComments;
      console.log(data.getComments)
return (
  <>
  <div className='comments-block'>

      <div className='top_commbocks'>
        <h3>Комментарии к записи</h3>
              <span className='length-comments'>всего {postcom.comments.length} комментариев</span>
      </div>
=======
      
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
>>>>>>> e92ec8683406a2d83f273207fbea01eadc64ef49

        <form onSubmit={event => {
          event.preventDefault();
          props.action({
            variables: {
              text,
              post: props.post._id
            }
          });
        }}>
        <textarea value={text} onChange={onChangeHandler} placeholder="Введите текст">Текст комментария</textarea>
        <button type="submit"  value={comments} onClick={onClickHandler}>Опубликовать</button>
        </form>

     <div>

        {arrcom.map(({text}) => (
            <div className='comment-block'  key={text.id}>
              <div>
                <h3>{text.post}</h3>
                <span>{format(new Date(postcom.createdAt), 'dd LLL yyyy  HH:mm')}</span>
              </div>
              <p>{text}</p>
            </div>    
        ))}
    </div>
    </div>
    </>
)
};

export default Comments;

