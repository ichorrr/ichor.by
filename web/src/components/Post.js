import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import PostUser from './PostUser';
import { format } from 'date-fns';
import UniBlock from '../components/UniBlock';
import Comments from '../components/Comments.js';
import {GET_ME} from '../gql/query';
import LikeDislike from './LikeDislike';

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

  const sourceUrl = post.externalSource && typeof post.externalSource === 'string'
    ? post.externalSource
    : post.externalSource?.url;
  const sourceIcon = post.externalSource && typeof post.externalSource === 'object'
    ? post.externalSource.icon
    : null;
  const sourceHref = sourceUrl ? (sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`) : null;

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
              👤 {post.author.name}
            </Link>
          </li>
          <li  className='plank-span'>
            <span>👁️ {post.viewsCount}</span>
          </li>
          <li style={{ marginLeft: 'auto' }}>
            <LikeDislike
              targetId={post._id}
              type="post"
              initialLikes={post.likesCount || 0}
              initialDislikes={post.dislikesCount || 0}
              isAuthenticated={!!localStorage.getItem('token')}
            />
          </li>
          </ul>
          <PostUser post={post} me={datacom} />
        </div>
      </div>

      {(sourceHref || (post.tags && post.tags.length > 0)) && (
        <div className="post-details-row">
          {sourceHref && (
            <div className="post-external-source">
              {sourceIcon ? (
                sourceIcon.startsWith('http') ? (
                  <img className="external-source-icon" src={sourceIcon} alt="source icon" />
                ) : (
                  <span className="external-source-icon-text">{sourceIcon}</span>
                )
              ) : null}
              <a href={sourceHref} target="_blank" rel="noreferrer">{sourceUrl}</a>
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.filter(Boolean).map(tag => (
                <span key={tag} className="tag">{tag.startsWith('#') ? tag : `#${tag}`}</span>
              ))}
            </div>
          )}
        </div>
      )}
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
