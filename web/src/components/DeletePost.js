import React from 'react';
import { useMutation, gql } from '@apollo/client';
import { withRouter, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { DELETE_POST } from '../gql/mutation';
import {GET_POST, GET_CATS, GET_NOTES, GET_MY_POST} from '../gql/query';

const DeletePost = props => {

  const navigate = useNavigate();

  const [deletePost] = useMutation(DELETE_POST, {
    variables: {
      id: props.postId
    },
    refetchQueries: [{query: GET_NOTES}, {query: GET_MY_POST}, {query: GET_CATS} ],
    onCompleted: data => {
      navigate('/myposts');
    }
  });

  return <Link onClick={deletePost} className="css-delete">Delete Post</Link>
};

export default DeletePost;
