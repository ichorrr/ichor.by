import React, { useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { GET_ME } from '../gql/query';
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
  // set the default state of the form
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
  const [externalSourceIcon, setExternalSourceIcon] = useState(
    props.externalSource && typeof props.externalSource === 'object'
      ? props.externalSource.icon || ''
      : ''
  );
  const [externalSourceUrl, setExternalSourceUrl] = useState(
    props.externalSource && typeof props.externalSource === 'object'
      ? props.externalSource.url || ''
      : typeof props.externalSource === 'string'
      ? props.externalSource
      : ''
  );
  const [tags, setTags] = useState({tags: Array.isArray(props.tags) ? props.tags.join(', ') : (props.tags || '')});
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

  const onChangeMDE3 = (body3) => {
    setBody3({body3});
  };

  const { data } = useQuery(GET_ME);
  const isAdmin = data?.me?.isAdmin;
  const adminOnlyCategoryIds = [
    '6251ef28413373118838bbdd',
    '6251f1532f7a51343c8ed7df',
  ];
  const defaultNoteCategory = '6251f1632f7a51343c8ed7e0';

  const externalSourcesList = [
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=onliner.by`, url: 'https://www.onliner.by/' },
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=lenta.ru`, url: 'https://lenta.ru/' },
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=bbc.com`, url: 'https://www.bbc.com/' },
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=edition.cnn.com`, url: 'https://edition.cnn.com/' },
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=realt.by`, url: 'https://realt.by/' },
    { icon: `https://www.google.com/s2/favicons?sz=64&domain=ixbt.com`, url: 'https://www.ixbt.com/' },
  ];

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

  const handleChangeFile = async (event) => {
          const formData = new FormData();
          const file = event.target.files[0];
          formData.append('imageUrl', file);
          const res = await fetch('https://api.ichor.by/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          setImageUrl({ imageUrl: data.url });
  }

  const handleChangeFile2 = async (event) => {
          const formData2 = new FormData();
          const file2 = event.target.files[0];
          formData2.append('imageUrl2', file2);
          const res2 = await fetch('https://api.ichor.by/upload2', {
            method: 'POST',
            body: formData2,
          });
          const data2 = await res2.json();
          setImageUrl2({ imageUrl2: data2.url });
  }

  const handleChangeFile3 = async (event) => {
    const formData3 = new FormData();
    const file3 = event.target.files[0];
    formData3.append('imageUrl3', file3);
    const res3 = await fetch('https://api.ichor.by/upload3', {
      method: 'POST',
      body: formData3,
    });
    const data3 = await res3.json();
    setImageUrl3({ imageUrl3: data3.url });
}

const ihandleChangeFile = async (event) => {
  const iformData = new FormData();
  const ifile = event.target.files[0];
  iformData.append('iconPost', ifile);
  const ires = await fetch('https://api.ichor.by/upload4', {
    method: 'POST',
    body: iformData,
  });
  const idata = await ires.json();
  setIconPost({ iconPost: idata.url });
}

  return (
    <Wrapper>
      <Form
        onSubmit={event => {
          event.preventDefault();
          const tagsArray = tags.tags ? tags.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

          if (!isAdmin && adminOnlyCategoryIds.includes(value.category)) {
            alert('Только администратор может выбрать категорию Новости или Статьи.');
            return;
          }

            const categoryToSend = isAdmin ? value.category : defaultNoteCategory;

            props.action({
              variables: {
                ...value,
                category: categoryToSend,
                ...body,
                ...body2,
                ...body3,
                ...iconPost,
                ...imageUrl,
                ...imageUrl2,
                ...imageUrl3,
                ...scriptUrl,
                externalSource: isAdmin && (externalSourceUrl || externalSourceIcon) ? {
                  icon: externalSourceIcon,
                  url: externalSourceUrl
                } : null,
                tags: tagsArray
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

      {isAdmin ? (
        <>
          <label htmlFor="externalSourceUrl">URL источника</label>
          <input
            type="url"
            name="externalSourceUrl"
            id="externalSourceUrl"
            placeholder="https://example.com"
            onChange={event => setExternalSourceUrl(event.target.value)}
            value={externalSourceUrl}
          />

          <div className="empty-div"></div>

          <label htmlFor="externalSourceIcon">Иконка источника</label>
          <input
            type="text"
            name="externalSourceIcon"
            id="externalSourceIcon"
            placeholder="URL иконки или emoji"
            onChange={event => setExternalSourceIcon(event.target.value)}
            value={externalSourceIcon}
          />

          <div className="empty-div"></div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {externalSourcesList.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setExternalSourceUrl(s.url); setExternalSourceIcon(s.icon); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                title={s.url}
              >
                <img src={s.icon} alt="src" style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 12 }}>{new URL(s.url).hostname}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="empty-div"></div>

      <label htmlFor="tags">Теги (через запятую)</label>
      <input
        type="text"
        name="tags"
        id="tags"
        placeholder="tag1, tag2, tag3"
        onChange={event => setTags({ tags: event.target.value })}
        value={tags.tags}
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
{isAdmin && (
        <>
          <div className="css-checkbox">
            <input type="checkbox" id="scriptUrl" name="scriptUrl" checked={scriptUrl.scriptUrl} onChange={onChangeCHK} />
            <label htmlFor="scriptUrl">Опубликовать на главной странице</label>
            <p>{scriptUrl.scriptUrl ? "checkedd" : "unchecked"}</p>
          </div>
          <div className="empty-div"></div>
        </>
      )}

      {isAdmin ? (
        <label htmlFor="category" className="style-select">
          <span>Выберите категорию записи</span>
          <select onChange={onChange} type="text"
            id="category" name="category" value={value.category}>
            <option value="">Введите категорию</option>
            <option value="6251ef28413373118838bbdd" disabled={!isAdmin}>Новости</option>
            <option value="6251f1532f7a51343c8ed7df" disabled={!isAdmin}>Статьи</option>
            <option value="6251f1632f7a51343c8ed7e0">Заметки</option>
          </select>
        </label>
      ) : (
        // non-admins shouldn't see category selector; default to Notes
        <input type="hidden" name="category" value={defaultNoteCategory} />
      )}

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
