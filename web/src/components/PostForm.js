import React, { useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import IsAdmin from './isAdmin.js';
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

const PostForm = props => {

  console.log(props)
  // set the default state of the form\
  const inputFileRef = useRef(null);
  const inputFileRef2 = useRef(null);
  const inputFileRef3 = useRef(null);
  const iref = useRef(null);
  const [body, setBody] = useState({body: props.body || ''});
  const [body2, setBody2] = useState({body2: props.body2 || ''});
  const [body3, setBody3] = useState({body3: props.body3 || ''});

  const [iconPost, setIconPost] = useState({iconPost: props.iconPost || ''});
  const [imageUrl, setImageUrl] = useState({imageUrl: props.imageUrl || ''});
  const [imageUrl2, setImageUrl2] = useState({imageUrl2: props.imageUrl2 || ''});
  const [imageUrl3, setImageUrl3] = useState({imageUrl3: props.imageUrl3 || ''});
  const [scriptUrl, setScriptUrl] = useState({scriptUrl: props.scriptUrl || false});
  const [value, setValue] = useState( { category: props.category, title: props.title || ''} );
  

console.log(<IsAdmin />);

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

  const onChangeMDE3 = (body3) => {
    setBody3({body3});
  };

  const onChangeCHK = (event) => {

    let scriptUrl = event.target.checked;

  setScriptUrl({scriptUrl});
  };

  const onClickRemoveImage =  async (imageUrl) => {
    imageUrl = '';
    setImageUrl({imageUrl});
  };

  const onClickRemoveImage2 = async (imageUrl2) => {
    imageUrl2 = '';
    setImageUrl2({imageUrl2});
  };

  const onClickRemoveImage3 = async (imageUrl3) => {
    imageUrl3 = '';
    setImageUrl3({imageUrl3});
  };

  const onClickRemoveIcon = async (iconPost) => {
    iconPost = '';
    setIconPost({iconPost});
  };

  const handleChangeFile = async (imageUrl) =>{

          const formData = new FormData();
          const file = event.target.files[0];
          formData.append('imageUrl', file);
          const res = await fetch('https://api.ichor.by/upload', {
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
          const res2 = await fetch('https://api.ichor.by/upload2', {
            method: 'POST',
            body: formData2,
          });
          const data2 = await res2.json();
          imageUrl2 = await data2.url;
          setImageUrl2({ imageUrl2});
  }

  const handleChangeFile3 = async (imageUrl3) =>{

    const formData3 = new FormData();
    const file3 = event.target.files[0];
    formData3.append('imageUrl3', file3);
    const res3 = await fetch('https://api.ichor.by/upload3', {
      method: 'POST',
      body: formData3,
    });
    const data3 = await res3.json();
    imageUrl3 = await data3.url;
    setImageUrl3({ imageUrl3});
}

const ihandleChangeFile = async (iconPost) =>{

  const iformData = new FormData();
  const ifile = event.target.files[0];
  iformData.append('iconPost', ifile);
  const ires = await fetch('https://api.ichor.by/upload4', {
    method: 'POST',
    body: iformData,
  });
  const idata = await ires.json();
  iconPost = await idata.url;
  setIconPost({ iconPost });
}

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
              ...body3,
              ...iconPost,
              ...imageUrl,
              ...imageUrl2,
              ...imageUrl3,
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
              <Button variant="contained" className='i-delete'  onClick={ onClickRemoveImage}  >Удалить изображение</Button>
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
      <label htmlFor="title">Название записи</label>
      <input
        required
        type="text"
        name="title"
        id="title"
        placeholder="Введите название"
        onChange={onChange}
        value={value.title}
      />

      <div className="empty-div"></div>


{/* Model Icon Upload */}
        <div className="iconBlock">

            <div className="iconViewer">
                  {iconPost.iconPost && (
                    <img src={iconPost.iconPost} />
                  )}
            </div>
            <div className="iblock"  >   
            <input
              ref={iref}
              className="custom-icon-input"
              type="file"
              name="iconPost"
              id="iconPost"
              onChange={ihandleChangeFile}
              value={value.props}
              />

            {iconPost.iconPost && (
            <>
              <Button variant="contained" className='i-delete'  onClick={ onClickRemoveIcon }  >Удалить</Button>
              <p className="p-imageurl">{iconPost.iconPost}</p>
            </>
            )}
            </div>
        </div>
     
{/* End Model Icon Upload */}

<div className="empty-div"></div>
      { <IsAdmin /> && (
        <>
      	<div className="css-checkbox" >
          <input type="checkbox" id="scriptUrl" name="scriptUrl" checked={scriptUrl.scriptUrl} onChange={onChangeCHK}  />
          <label htmlFor="scriptUrl">Опубликовать на главной странице</label>
          <p>{scriptUrl.scriptUrl ? "checkedd" : "unchecked"}</p>
        </div>
        <div className="empty-div"></div>
        </>
      )}

      <label htmlFor="category" className="style-select">
      <span>Выберите категорию записи</span>
               <select onChange={onChange} type="text"
                 id="category" name="category" value={value.category}>
                 <option >Введите категорию</option>
                 <option value="6251ef28413373118838bbdd">Новости</option>
                 <option value="6251f1532f7a51343c8ed7df">Статьи</option>
                 <option value="6251f1632f7a51343c8ed7e0">Заметки</option>
               </select>
             </label>

        <div className="empty-div"></div>

        <label htmlFor="title">Текстовый блок №1</label>
        <div className="style-simplemde" >
             <SimpleMDE
                       required
                       type="text"
                       name="body"
                       id="body"
                       placeholder="Содердание"
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
                <Button className='i-delete' variant="contained" onClick={ onClickRemoveImage2}  >Remove image</Button>
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
        
        <label htmlFor="title">Текстовый блок №2</label>
        <div className="style-simplemde" >
             <SimpleMDE
                       required
                       type="text"
                       name="body2"
                       id="body2"
                       placeholder="Содердание"
                       onChange={onChangeMDE2}
                       value={body2.body2}
                     />
        </div>
      </div>

      <div className="empty-div"></div>

            <div className="imageUrl">
            <input
              ref={inputFileRef3}
              className="custom-file-input"
              type="file"
              name="imageUrl3"
              id="imageUrl3"
              onChange={handleChangeFile3}
              value={value.props}
              />

              {imageUrl3.imageUrl3 && (
              <>
                <Button variant="contained" className='i-delete' onClick={ onClickRemoveImage3}  >Remove image</Button>
                <p className="p-imageurl">{imageUrl3.imageUrl3}</p>
              </>
             )}
              </div>
            {imageUrl3.imageUrl3 && (

              <div className="imageViewer">
                <img src={imageUrl3.imageUrl3} />
              </div>

            )}
            <div className="empty-div"></div>
        <label htmlFor="title">Текстовый блок №3</label>
        <div className="style-simplemde" >
             <SimpleMDE
                       required
                       type="text"
                       name="body3"
                       id="body3"
                       placeholder="Содердание"
                       onChange={onChangeMDE3}
                       value={body3.body3}
                     />
        </div>
    
      <div className="algn-btn">
        <button className="save-note" type="submit" > Сохранить запись</button>
        </div>
      </Form>
    </Wrapper>
  );
};

export default PostForm;
