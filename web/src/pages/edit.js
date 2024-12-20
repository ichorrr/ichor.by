import React, {useEffect} from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import PostForm from '../components/PostForm';
import { GET_POST, GET_ME } from '../gql/query';
import {EDIT_POST} from '../gql/mutation';

const EditPost = () => {
  let ids = useParams();
  const navigate = useNavigate();
  const id = ids.id;

  useEffect(() => {
    document.title = 'Edit Posts - ICHOR.BY';
  });

  const {data: userdata } = useQuery(GET_ME);
  const {  loading, error, data } = useQuery(GET_POST, { variables: { id } });

const [editPost] = useMutation(EDIT_POST, {
    variables: {
      id
    },
    onCompleted: () => {
      navigate(`/posts/${id}`);
    }
  });

if (loading) return <p>loading...</p>;
if (error) return <p>error...</p>;


if(userdata.me._id !== data.getPost.author._id)
{return <p>You do not have access to edit this post</p>}
  return <div>
  <div className="top-new-post">
  <h1>Редактировать запись  - исправьте запись, измените категорию, сохраните изменения</h1>
  </div>
  <div>
    
  <PostForm iconPost={data.getPost.iconPost} body={data.getPost.body} body2={data.getPost.body2} body3={data.getPost.body3} imageUrl={data.getPost.imageUrl} imageUrl2={data.getPost.imageUrl2} imageUrl3={data.getPost.imageUrl3} scriptUrl={data.getPost.scriptUrl} title={data.getPost.title} category={data.getPost.category._id} action={editPost}/>
  {console.log(data)}
</div>

</div>
};

export default EditPost;
