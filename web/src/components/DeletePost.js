import React, {useState} from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { DELETE_POST } from '../gql/mutation';
import {GET_CATS, GET_NOTES, GET_MY_POST} from '../gql/query';
import Modal from './ModalWin';

const DeletePost = props => {

  const navigate = useNavigate();
  const [modal, setModal] = useState(false); 

  const [deletePost] = useMutation(DELETE_POST, {
    variables: {
      id: props.postId
    },
    refetchQueries: [{query: GET_NOTES}, {query: GET_MY_POST}, {query: GET_CATS} ],
    onCompleted: data => {
      navigate('/myposts');
    }
  });

  return (
    <>
  
  <Link onClick={() => setModal(true)} className="css-delete">Удалить запись</Link>
    <Modal act={modal} setAct={setModal} >
      <div className='tert'>
        <p>Вы точно уверены, что хотите<Link onClick={deletePost} >удалить</Link> запись?</p>
      </div>
    </Modal>
</>)
};

export default DeletePost;
