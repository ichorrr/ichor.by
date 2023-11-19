import React, {useEffect, useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import {GET_ME} from '../gql/query';
import DeletePost from './DeletePost.js';

const PostUser = props => {

  const rootEl = useRef(null);
  const [alert, setAlert] = useState(false);

  useEffect(() => {

    const onClick = e => {
      if(rootEl.current && alert && !rootEl.current.contains(e.target))
      {setAlert(false)}}
      document.addEventListener('click', onClick);
      }, [alert, setAlert]);

  const { loading, error, data } = useQuery(GET_ME);
    if (loading) return <p>Loading...</p>;
    if (error) return null;

  return (
<>
{ data.me._id === props.post.author._id && (

  <div className="svg-plank" ref={rootEl} onClick={() => setAlert(!alert)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="26" viewBox="0 0 28 26">
        <circle id="Эллипс_2" data-name="Эллипс 2" className="small-menu-01" cx="14" cy="14" r="11.125"/>
        <path id="Линия_1" data-name="Линия 1" className="small-menu-02" d="M9,17V15H19v2H9Z"/>
        <path id="Линия_1_копия" data-name="Линия 1 копия" className="small-menu-02" d="M9,13V11H19v2H9Z"/>
      </svg>
    </div>
)}
  <div className={"svg-menu-plank" +" " +`${(alert) ? "dxnv" : "dddd"}`} >
  <h4>Control panel for post</h4>
  <React.Fragment>
  <span>
    <Link to={`/edit/${props.post._id}`} className="css-edit">Edit</Link>
    <DeletePost postId={props.post._id} />
  </span>
  </React.Fragment>
  </div>
</>
 )};

export default PostUser;
