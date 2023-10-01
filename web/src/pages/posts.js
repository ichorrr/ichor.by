import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import { useQuery, gql } from '@apollo/client';
import { GET_POST } from '../gql/query';

const PostPage = () => {
  let  { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_POST, { variables: { id },

    refetchQueries: [{query: GET_POST }]} );

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  return (
    <>
      <Link to={-1}  className="css-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
          <circle className="xcls-1" cx="23" cy="23" r="23" stroke="#ededed" strokeWidth="0" fill="#ffffff" />
          <path className="xcls-2" d="M31.96,29.476l-2.594,2.347-6.052-5.476L17.619,31.5l-2.594-2.347L20.72,24l-5.694-5.152L17.619,16.5l5.694,5.152,6.052-5.476,2.594,2.347L25.908,24Z"/>
        </svg>
      </Link>
      <Post post={data.getPost} />
    </>
  )};

export default PostPage;
