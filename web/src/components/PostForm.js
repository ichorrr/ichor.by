import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

import Button from './Button';

const Wrapper = styled.div`
  max-width: 80%;
  padding: 1em;
  margin: 0 auto;

  label {
    padding: 1em 0 .5em 0;
  }
`;

const Form = styled.form`
  label,
  input {
    line-height: 2em;
  }
`;

const SimpleMDE = styled.textarea`
  width: 95%;
  height: 200px;
  font-size: 2.5em;
`;

const PostForm = props => {
  // set the default state of the form\
  const inputFileRef = useRef(null);
  const inputFileRef2 = useRef(null);
  const [body, setBody] = useState({body: props.body || ''});
  const [body2, setBody2] = useState({body2: props.body2 || ''});
  const [imageUrl, setImageUrl] = useState({imageUrl: props.imageUrl || ''});
  const [imageUrl2, setImageUrl2] = useState({imageUrl2: props.imageUrl2 || ''});
  const [scriptUrl, setScriptUrl] = useState({scriptUrl: props.scriptUrl || false});
  const [value, setValue] = useState( { category: props.category, title: props.title || ''} );

  // update the state when a user types in the form
  const onChange = event => {
    setValue({
      ...value,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeMDE = (body) => {
    setBody({body});
  };

  const onChangeMDE2 = (body2) => {
    setBody2({body2});
  };

  const onChangeCHK = (event) => {

    let scriptUrl = event.target.checked;

  setScriptUrl({scriptUrl});
  };

  const handleChangeFile = async (imageUrl) =>{

          const formData = new FormData();
          const file = event.target.files[0];
          formData.append('imageUrl', file);
          const res = await fetch('http://localhost:4000/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          imageUrl = await data.url;
          setImageUrl({ imageUrl});

  }

  const handleChangeFile2 = async (imageUrl2) =>{

          const formData2 = new FormData();
          const file2 = event.target.files[0];
          formData2.append('imageUrl2', file2);
          const res2 = await fetch('http://localhost:4000/upload2', {
            method: 'POST',
            body: formData2,
          });
          const data2 = await res2.json();
          imageUrl2 = await data2.url;
          setImageUrl2({ imageUrl2});

  }

  const onClickRemoveImage =() => {
    setImageUrl('');
  };

  const onClickRemoveImage2 =() => {
    setImageUrl2('');
  };

  return (
    <Wrapper>
      <Form
        onSubmit={event => {
          event.preventDefault();

          props.action({
            variables: {
              ...value,
              ...body,
              ...body2,
              ...imageUrl,
              ...imageUrl2,
              ...scriptUrl
            }
          });
        }}
      >
      <div className="style-title">
        <div className="imageUrl">
            <input
              ref={inputFileRef}
              className="custom-file-input"
              type="file"
              name="imageUrl"
              id="imageUrl"
              onChange={handleChangeFile}
              value={value.props}
              />

            {imageUrl.imageUrl && (
            <>
              <Button variant="contained" onClick={ onClickRemoveImage}  >Remove image</Button>
              <p className="p-imageurl">{imageUrl.imageUrl}</p>
            </>
           )}

        </div>
        {imageUrl.imageUrl && (

            <div className="imageViewer">
              <img src={imageUrl.imageUrl} />
            </div>

        )}
      <div className="empty-div"></div>
      <label htmlFor="title">Title Post:</label>
      <input
        required
        type="text"
        name="title"
        id="title"
        placeholder="enter title"
        onChange={onChange}
        value={value.title}
      />

      <div className="empty-div"></div>

      	<div className="css-checkbox" >
          <input type="checkbox" id="scriptUrl" name="scriptUrl" checked={scriptUrl.scriptUrl} onChange={onChangeCHK}  />
          <label htmlFor="scriptUrl">Put in desktop</label>
          <p>{scriptUrl.scriptUrl ? "checkedd" : "unchecked"}</p>
        </div>

        <div className="empty-div"></div>

      <label htmlFor="category" className="style-select">
      <span>Category Post:</span>
               <select onChange={onChange} type="text"
                 id="category" name="category" value={value.category}>
                 <option >enter category</option>
                 <option value="6251ef28413373118838bbdd">news</option>
                 <option value="6251f1532f7a51343c8ed7df">arts</option>
                 <option value="6251f1632f7a51343c8ed7e0">notes</option>
               </select>
             </label>

        <div className="empty-div"></div>

        <label htmlFor="title">News Content:</label>
        <div className="style-simplemde" >
             <SimpleMDE
                       required
                       type="text"
                       name="body"
                       id="body"
                       placeholder="Post content"
                       onChange={onChangeMDE}
                       value={body.body}
                     />
        </div>
        <div className="empty-div"></div>

            <div className="imageUrl">
            <input
              ref={inputFileRef2}
              className="custom-file-input"
              type="file"
              name="imageUrl2"
              id="imageUrl2"
              onChange={handleChangeFile2}
              value={value.props}
              />

              {imageUrl2.imageUrl2 && (
              <>
                <Button variant="contained" onClick={ onClickRemoveImage2}  >Remove image</Button>
                <p className="p-imageurl">{imageUrl2.imageUrl2}</p>
              </>
             )}
              </div>
            {imageUrl2.imageUrl2 && (

              <div className="imageViewer">
                <img src={imageUrl2.imageUrl2} />
              </div>

            )}
            <div className="empty-div"></div>
        <label htmlFor="title">News Content 2:</label>
        <div className="style-simplemde" >
             <SimpleMDE
                       required
                       type="text"
                       name="body2"
                       id="body2"
                       placeholder="Post content"
                       onChange={onChangeMDE2}
                       value={body2.body2}
                     />
        </div>
      </div>
      <div className="algn-btn">
        <Button type="submit"> Save note</Button>
        </div>
      </Form>
    </Wrapper>
  );
};

export default PostForm;
