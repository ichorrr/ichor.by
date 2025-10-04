import React, {useEffect, useState, lazy} from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import PostUser from './PostUser';
import styled from 'styled-components';
import UniBlock from '../components/UniBlock';
import { format } from 'date-fns';

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const dats = {
  isLoggedIn: !!localStorage.getItem('token')
};

const H4R = styled.div`
  background-color: #fff;
  display: inline;
  padding: 0.5em 0.8em;
  margin: 0.5em 1em 0.5em 0;
  font: normal 0.9em Arial, sans-serif;

  :hover {
    color: #fff;
    cursor: pointer;
    background: #bb0106;
  }
`;

  const ImgStyle = styled.div`
  width: 100%;
  max-height: 500px;
  overflow: hidden;

  img {
    background-size: 100%;
  }
`;

const PRiv4 = styled.div`
  font-family: Arial, sans-serif;
  font-size: 1.2em;
`;

const H2 = styled.h2`
  font-family: Arial, sans-serif;
  font-size: 4.2em;
  line-height: 1.3em;
`;

const linkStyle = {
  textDecoration: 'none',
  padding: '0'
};

const PostList = ({ post }) => {

  let idcat = post.category._id;
  let iduser = post.author._id;

  const { loading, error, data } = useQuery(IS_LOGGED_IN);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (

    <article>
    <div id={post._id} ></div>
    <UniBlock post={post._id}/>
    <ImgStyle>
      <img src={post.imageUrl} />
    </ImgStyle>
    <div className="absPostPart">
      <Link style={linkStyle} to={`/posts/${post._id}`}><H2>{post.title}</H2></Link>
      <Link style={linkStyle} to={`/cats/${idcat}`}>
        <H4R>{post.category.catname}</H4R>
      </Link>
      <H4R>{format(new Date(post.createdAt), 'dd LLL yyyy')}</H4R>
      <Link style={linkStyle} to={`/users/${iduser}`}>
        <H4R>{`Автор ${post.author.name}`}</H4R>
      </Link>
      <H4R>{`Просмотров ${post.viewsCount}`}</H4R>
      <PRiv4>
        <ReactMarkdown children={post.body} />
      </PRiv4>
      {dats && (
              <div>
                <PostUser post={post} />
              </div>
            )}
      </div>
    </article>
  );
};

export default PostList;
