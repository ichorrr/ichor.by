import React, {useState} from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { DELETE_COMM } from '../gql/mutation';
import {GET_COMMENTS} from '../gql/query';
import Modal from './ModalWin';

const DeleteComm = props => {
    const [modal, setModal] = useState(false); 
  
    const [deleteComment] = useMutation(DELETE_COMM, {
      variables: {
        id: props.id
      },
      refetchQueries: [{query: GET_COMMENTS} ],
      onCompleted: () => {
        window.location.reload();
      }
    });
  
    return (
      <>
    
    <Link onClick={() => setModal(true)} className="delete-comm">Удалить комментарий</Link>
      <Modal act={modal} setAct={setModal} >
        <div className='tert'>
          <p>Вы уверены, что хотите <Link onClick={deleteComment} >удалить</Link> комментарий?</p>
        </div>
      </Modal>
  </>)
  }

export default DeleteComm;
