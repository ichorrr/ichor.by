import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

import PostForm from '../components/PostForm';

import { GET_MY_POST, GET_NOTES } from '../gql/query';

const NEW_POST = gql`
  mutation createPost($title: String!, $iconPost: String, $imageUrl: String, $imageUrl2: String, $imageUrl3: String, $imageUrl4: String, $scriptUrl: Boolean, $externalSource: ExternalSourceInput, $tags: [String], $category: String!, $body: String!, $body2: String, $body3: String, $body4: String) {
    createPost(title: $title, iconPost: $iconPost, imageUrl: $imageUrl, imageUrl2: $imageUrl2, imageUrl3: $imageUrl3, imageUrl4: $imageUrl4, scriptUrl: $scriptUrl, externalSource: $externalSource, tags: $tags, category: $category, body: $body, body2: $body2, body3: $body3, body4: $body4) {
      _id
        title
        iconPost
        imageUrl
        imageUrl2
        imageUrl3
          imageUrl4
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
          body4
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
      <section className="new-post-page">
        <div className="new-post-success">
          <h1>Запись отправлена на модерацию</h1>
          <p>Спасибо! Ваша запись получена и направлена на проверку администратором. После одобрения она станет доступна всем читателям.</p>
          <p>Администратор также отправит вам уведомление в чате о решении по публикации.</p>
          <button type="button" onClick={() => navigate('/myprofile')}>Перейти в профиль</button>
        </div>
      </section>
    );
  }

  return (
    <section className="new-post-page">
      {loading && <p className="new-post-status" role="status">Сохраняем запись…</p>}
      {error && <p className="new-post-error" role="alert">Не удалось сохранить запись. Попробуйте ещё раз.</p>}
      <header className="top-new-post new-post-page__header">
        <h1>Новая запись</h1>
        <p className="p-newpost">Добавьте содержание, выберите категорию, загрузите изображения и опубликуйте на сайте.</p>
      </header>
      <PostForm action={data} requireRequiredTag={true} />
    </section>
  );
};

export default NewPost;
