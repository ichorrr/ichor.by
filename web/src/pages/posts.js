import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Post from '../components/Post';
import { useQuery } from '@apollo/client';
import { GET_POST, GET_POSTS } from '../gql/query';
import Futer from '../components/Futer';

const PostPage = () => {
  let  { id } = useParams();

  const { loading, error, data } = useQuery(GET_POST, { variables: { id },
    refetchQueries: [{query: GET_POST }]} );
  const { loading: relatedLoading, error: relatedError, data: relatedData } = useQuery(GET_POSTS);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  const relatedPosts = relatedData?.getPosts?.filter(post => post._id !== id).slice(0, 5) || [];

  return (
    <>
      <Link to={-1}  className="css-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
          <circle className="xcls-1" cx="23" cy="23" r="23" stroke="#ededed" strokeWidth="0" fill="#ffffff" />
          <path className="xcls-2" d="M31.96,29.476l-2.594,2.347-6.052-5.476L17.619,31.5l-2.594-2.347L20.72,24l-5.694-5.152L17.619,16.5l5.694,5.152,6.052-5.476,2.594,2.347L25.908,24Z"/>
        </svg>
      </Link>
      <div className="post-page-layout">
        <div className="post-main">
          <Post post={data.getPost} />
        </div>
        <aside className="post-side-links">
          <h3>Следующие заметки</h3>
          {relatedLoading && <p>Загрузка...</p>}
          {relatedError && <p>Не удалось загрузить заметки.</p>}
          {!relatedLoading && !relatedError && relatedPosts.length === 0 && <p>Нет других заметок.</p>}
          {!relatedLoading && !relatedError && relatedPosts.map(post => (
            <Link key={post._id} to={`/posts/${post._id}`}>
              {post.title}
            </Link>
          ))}
        </aside>
      </div>
      <Futer />
    </>
  )};

export default PostPage;
