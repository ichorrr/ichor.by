import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

import PostForm from '../components/PostForm';

import { GET_MY_POST, GET_NOTES } from '../gql/query';

const NEW_POST = gql`
  mutation createPost($title: String!, $iconPost: String, $imageUrl: String, $imageUrl2: String, $imageUrl3: String, $scriptUrl: Boolean, $category: String!, $body: String!, $body2: String!, $body3: String!) {
    createPost(title: $title, iconPost: $iconPost, imageUrl: $imageUrl, imageUrl2: $imageUrl2, imageUrl3: $imageUrl3, scriptUrl: $scriptUrl, category: $category, body: $body, body2: $body2, body3: $body3 ) {
      _id
        title
        iconPost
        imageUrl
        imageUrl2
        imageUrl3
        scriptUrl
        category{
          _id
          catname
        }
        body
        body2
        body3
        author {
          _id
          name
        }
        comments{
          _id
          text
        }
      }
    }`;

const NewPost = props => {

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Новая запись - ICHOR.BY';
  });

  const [ data, { loading, error } ] = useMutation(NEW_POST, {
    refetchQueries: [{ query: GET_MY_POST }, { query: GET_NOTES }],
    onCompleted: data => {
      console.log(data.createPost)
      navigate(`/posts/${data.createPost._id}`);
    }
  });

  return (
    <>
      {loading && <p> loading...</p>}
      {error && <p>Error saving the note</p>}
      <div className="top-new-post">
      <h1><span className='bold-class'>Новая запись</span></h1><p className='p-newpost'>Добавьте содержание, выберите категорию, загрузите изображения и опубликуйте на сайте.</p>
      </div>
      <PostForm action={data} />
    </>
  );
};

export default NewPost;
