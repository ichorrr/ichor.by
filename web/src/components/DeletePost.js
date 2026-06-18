import React, {useState} from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { DELETE_POST } from '../gql/mutation';
import {GET_CATS, GET_NOTES, GET_MY_POST} from '../gql/query';
import Modal from './ModalWin';

const DeletePost = props => {

  const navigate = useNavigate();
  const [modal, setModal] = useState(false); 

  const [deletePostMutation] = useMutation(DELETE_POST, {
    refetchQueries: [{query: GET_NOTES}, {query: GET_MY_POST}, {query: GET_CATS}],
    awaitRefetchQueries: true,
    onCompleted: () => {
      navigate('/myposts');
    },
    onError: mutationError => {
      console.error('Delete post error:', mutationError);
      alert('Ошибка при удалении записи: ' + mutationError.message);
    }
  });

  const handleDelete = async () => {
    await deletePostMutation({
      variables: {
        id: props.postId
      }
    });
  };

  return (
    <>
      <Link
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setModal(true);
        }}
        className="css-delete"
      >
        Удалить запись
      </Link>
      <Modal act={modal} setAct={setModal} >
        <div className='tert'>
          <p>
            Вы точно уверены, что хотите{' '}
            <button type="button" onClick={handleDelete} className="css-delete">
              удалить
            </button>{' '}
            запись?
          </p>
        </div>
      </Modal>
    </>
  )
};

export default DeletePost;
