import React, {useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient, gql } from '@apollo/client';
import PostUser from './PostUser';
import { format } from 'date-fns';
import styled from 'styled-components';
import UniBlock from '../components/UniBlock';
import Comments from '../components/Comments';


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


const H4R = styled.div`
  display: inline;
  font: normal 1em Arial, sans-serif;
  padding: 1.1em;
`;

const tkn = {
  isLoggedIn: !!localStorage.getItem('token')
};

const Post = ({ post }) => {

  let idcat = post.category._id;
  let iduser = post.author._id;

  const [ data, { loading, error } ] = useMutation( NEW_COMMENT );

  return (
<>
    <article>

    <div className='top-block'>
      <div id={post._id} ></div>
      <h2>{post.title}</h2>
    
      <div className="all-post-block">
        <div className="css-plank">
          <Link  to={`/cats/${idcat}`}>
            {post.category.catname}
          </Link>
     
          <H4R>{format(new Date(post.createdAt), 'dd LLL yyyy  HH:mm')}</H4R>
          <Link  to={`/users/${iduser}`}>
            {`Автор ${post.author.name}`}
          </Link>
          <H4R>{`Просмотров ${post.viewsCount}`}</H4R>
            <PostUser post={post} />
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
    {tkn.isLoggedIn ? (
      <Comments action={data} post={post} />
    ):(<></>)}
    
    </>
  );
};

export default Post;
