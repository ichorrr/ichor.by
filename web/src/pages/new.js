import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

import PostForm from '../components/PostForm';

import { GET_MY_POST, GET_NOTES } from '../gql/query';

const NEW_POST = gql`
  mutation createPost($title: String!, $iconPost: String, $imageUrl: String, $imageUrl2: String, $imageUrl3: String, $scriptUrl: Boolean, $externalSource: ExternalSourceInput, $tags: [String], $category: String!, $body: String!, $body2: String!, $body3: String!) {
    createPost(title: $title, iconPost: $iconPost, imageUrl: $imageUrl, imageUrl2: $imageUrl2, imageUrl3: $imageUrl3, scriptUrl: $scriptUrl, externalSource: $externalSource, tags: $tags, category: $category, body: $body, body2: $body2, body3: $body3 ) {
      _id
        title
        iconPost
        imageUrl
        imageUrl2
        imageUrl3
        scriptUrl
        externalSource {
          icon
          url
        }
        tags
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Новая запись - ICHOR.BY';
  });

  const [ data, { loading, error } ] = useMutation(NEW_POST, {
    refetchQueries: [{ query: GET_MY_POST }, { query: GET_NOTES }],
    onCompleted: response => {
      const createdPost = response?.createPost;
      if (createdPost?._id) {
        setSubmitted(true);
      }
    },
    onError: () => {
      setSubmitted(false);
    }
  });

  if (submitted) {
    return (
      <div className="top-new-post" style={{ maxWidth: 780, margin: '2rem auto', padding: '0 1rem' }}>
        <h1><span className='bold-class'>Запись отправлена на модерацию</span></h1>
        <p className='p-newpost'>Спасибо! Ваша запись получена и направлена на проверку администратором. После одобрения она станет доступна всем читателям.</p>
        <p>Администратор также отправит вам уведомление в Чат о решении по публикации.</p>
        <button onClick={() => navigate('/myprofile')} style={{ marginTop: '1rem' }}>Перейти в профиль</button>
      </div>
    );
  }

  return (
    <>
      {loading && <p> loading...</p>}
      {error && <p>Не удалось сохранить запись. Попробуйте ещё раз.</p>}
      <div className="top-new-post">
      <h1><span className='bold-class'>Новая запись</span></h1><p className='p-newpost'>Добавьте содержание, выберите категорию, загрузите изображения и опубликуйте на сайте.</p>
      </div>
      <PostForm action={data} requireRequiredTag={true} />
    </>
  );
};

export default NewPost;
