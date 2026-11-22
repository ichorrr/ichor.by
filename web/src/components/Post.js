import React, {useEffect, useState, useRef} from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { format } from 'date-fns';
import UniBlock from '../components/UniBlock';
import Comments from '../components/Comments.js';
import {GET_ME} from '../gql/query';
import LikeDislike from './LikeDislike';
import PostMedia from './PostMedia';
import SharePost from './SharePost';
import DeletePost from './DeletePost.js';

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

const JOIN_ARTICLE_DISCUSSION = gql`
  mutation JoinArticleDiscussion($postId: ID!) {
    joinArticleDiscussion(postId: $postId) {
      _id
    }
  }
`;

const Post = ({ post }) => {

  const navigate = useNavigate();

  const rootEl = useRef(null);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
  
      const onClick = e => {
        if(rootEl.current && alert && !rootEl.current.contains(e.target))
        {setAlert(false)}}
        document.addEventListener('click', onClick);
  }, [alert, setAlert]);

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
      const commentId = data?.createComment?._id;
      if (commentId) {
        window.location.hash = `comment-${commentId}`;
      }
      window.location.reload();
    }
  } );
  const [joinDiscussion, { loading: joining, error: discussionError }] = useMutation(JOIN_ARTICLE_DISCUSSION, {
    onCompleted: result => navigate(`/chat/${result.joinArticleDiscussion._id}`),
    onError: err => console.error('Unable to open article discussion:', err)
  });

  return (
<>
    <article className='css-post'>

    <div className='top-block'>
      <div id={post._id} ></div>
      <h2>{post.title}</h2>

      <div className="post-toolbar">
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
        <div className="post-actions">
          <button
            type="button"
            className="post-actions__discuss"
            disabled={joining}
            onClick={() => {
              if (!localStorage.getItem('token')) {
                navigate('/signin');
                return;
              }
              joinDiscussion({ variables: { postId: post._id } });
            }}
          >
            {joining ? 'Открываем чат…' : 'Обсудить в чате'}
          </button>
          <SharePost post={post} />
        </div>
        {discussionError && <span role="alert">Не удалось открыть обсуждение: {discussionError.message}</span>}
      </div>
      

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
          <li className="post-like-menu-slot">
            <LikeDislike
              targetId={post._id}
              type="post"
              initialLikes={post.likesCount || 0}
              initialDislikes={post.dislikesCount || 0}
              isAuthenticated={!!localStorage.getItem('token')}
            />
          </li>
          {datacom?.me?._id === post.author._id && (
            <>
            <li className="post-user-menu-slot">
             <div className="svg-plank" ref={rootEl} onClick={() => setAlert(!alert)}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="26" viewBox="0 0 28 26">
                     <circle id="Эллипс_2" data-name="Эллипс 2" className="small-menu-01" cx="14" cy="14" r="11.125"/>
                     <path id="Линия_1" data-name="Линия 1" className="small-menu-02" d="M9,17V15H19v2H9Z"/>
                     <path id="Линия_1_копия" data-name="Линия 1 копия" className="small-menu-02" d="M9,13V11H19v2H9Z"/>
                   </svg>
              </div>
            </li>
            <li>
              <div className={"svg-menu-plank" +" " +`${(alert) ? "dxnv" : "dddd"}`} >
                  <h4>Панель управления</h4>

                  <ul>
                    <li>
                      <Link to={`/edit/${post._id}`} className="css-edit">Редактировать</Link>
                    </li>
                    <li>
                      <DeletePost postId={post._id} />
                    </li>
                  </ul>
                </div>
            </li>
            </>
          )}
          </ul>
        </div>
      </div>

      {(sourceHref || (post.tags && post.tags.length > 0)) && (
        <div className="post-details-row">

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.filter(Boolean).map(tag => {
                const normalizedTag = `${tag}`.trim();
                const hrefTag = encodeURIComponent(normalizedTag.replace(/^#/, ''));
                return (
                  <Link key={tag} to={`/tag/${hrefTag}`} className="tag">
                    {normalizedTag.startsWith('#') ? normalizedTag : `#${normalizedTag}`}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

    <div className="post-canvas" >
      <UniBlock post={post._id}/>
    </div>
    
    {post.imageUrl && (<div className="imgStyle">
      <PostMedia urls={post.imageUrl} alt={post.title} />
    </div>)}

      <div className="absPostPart">
        <div className="css-txt">

          <ReactMarkdown children={post.body}  />

          {post.imageUrl2 && (
          <div className="img-post">
            <PostMedia urls={post.imageUrl2} enableSlider alt={post.title} />
          </div>)}

          <ReactMarkdown children={post.body2}  />

          {post.imageUrl3 && (
          <div className="img-post">
            <PostMedia urls={post.imageUrl3} enableSlider alt={post.title} />
          </div>)}

          <ReactMarkdown children={post.body3}  />

          {post.imageUrl4 && (
            <div className="img-post">
              <PostMedia urls={post.imageUrl4} enableSlider alt={post.title} />
            </div>
          )}

          <ReactMarkdown children={post.body4} />

        </div>
      </div>
    </article>
<Comments action={data} post={post} me={datacom} isSubmitting={loading}/>
    </>
  );
};

export default Post;
