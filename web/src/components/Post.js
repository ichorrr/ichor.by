import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import PostUser from './PostUser';
import { format } from 'date-fns';
import styled from 'styled-components';
import UniBlock from '../components/UniBlock';
import Comments from '../components/Comments.js';
import { useNavigate } from 'react-router-dom';
import {GET_ME} from '../gql/query';

const NEW_COMMENT = gql`
  mutation createComment($text: String!, $post: String!) {
    createComment(text: $text, post: $post ) {
      _id
        text
        post{
          _id
          title
        }
          createdAt
          author {
          _id
          name
          }
      }
    }`;

const Post = ({ post }) => {

  const navigate = useNavigate();

  let idcat = post.category._id;
  let iduser = post.author._id;

  
    const { data: datacom } = useQuery( GET_ME);
    

  const [ data, { loading, error } ] = useMutation( NEW_COMMENT, {
    
    onCompleted: data => {
      window.location.reload(),
      navigate(`/posts/${post._id}`);
    }
  } );

  return (
<>
    <article className='css-post'>

    <div className='top-block'>
      <div id={post._id} ></div>
      <h2>{post.title}</h2>
    
      <div className="all-post-block">
        <div className="css-plank">
        <ul>
          <li>  
          <Link  to={`/cats/${idcat}`}>
            {post.category.catname}
          </Link>
          </li>
          <li className='plank-span'>
            <span>{format(new Date(post.createdAt), 'dd LLL yyyy  HH:mm')}</span>
          </li>
          <li>
            <Link  to={`/users/${iduser}`}>
              {`Автор ${post.author.name}`}
            </Link>
          </li>
          <li  className='plank-span'>
            <span>{`Просмотров ${post.viewsCount}`}</span>
          </li>
          </ul>
        <PostUser post={post} me={datacom} />
        </div>
              
           
      </div>
    </div>

    <div className="post-canvas" >
      <UniBlock post={post._id}/>
    </div>
    
    {post.imageUrl && (<div className="imgStyle">
      <img src={post.imageUrl} />
    </div>)}

      <div className="absPostPart">
        <div className="css-txt">

          <ReactMarkdown children={post.body}  />

          {post.imageUrl2 && (
          <div className="img-post">
            <img src={post.imageUrl2} />
          </div>)}

          <ReactMarkdown children={post.body2}  />

          {post.imageUrl3 && (
          <div className="img-post">
            <img src={post.imageUrl3} />
          </div>)}

          <ReactMarkdown children={post.body3}  />

        </div>
      </div>
    </article>
<Comments action={data} post={post} me={datacom}/>
    </>
  );
};

export default Post;
