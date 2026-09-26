import React, { useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { GET_ME } from '../gql/query';
import { getUploadBase } from '../utils/api';
import Button from './Button';
import PostMedia from './PostMedia';

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
  const [body4, setBody4] = useState({body4: props.body4 || ''});
  const [uploadError, setUploadError] = useState('');

  const [iconPost, setIconPost] = useState({iconPost: props.iconPost || ''});
  const [imageUrl, setImageUrl] = useState({imageUrl: props.imageUrl || ''});
  const [imageUrl2, setImageUrl2] = useState({imageUrl2: props.imageUrl2 || ''});
  const [imageUrl3, setImageUrl3] = useState({imageUrl3: props.imageUrl3 || ''});
  const [imageUrl4, setImageUrl4] = useState({imageUrl4: props.imageUrl4 || ''});
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
  const requiredTags = ['Главное', 'Технологии', 'События', 'Экономика', 'Люди', 'Происшествия', 'Недвижимость', 'Дизайн'];
  const [tags, setTags] = useState({tags: Array.isArray(props.tags) ? props.tags.join(', ') : (props.tags || '')});
  const [selectedRequiredTags, setSelectedRequiredTags] = useState(() => {
    const existingTags = Array.isArray(props.tags)
      ? props.tags
      : typeof props.tags === 'string'
      ? props.tags.split(',')
      : [];

    return existingTags
      .map(tag => (tag || '').trim().replace(/^#/, ''))
      .filter(Boolean)
      .filter(tag => requiredTags.includes(tag));
  });
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

  const onChangeMDE4 = (body4) => {
    setBody4({body4});
  };

  const { data } = useQuery(GET_ME);
  const isAdmin = data?.me?.isAdmin;
  const requireRequiredTagSelection = Boolean(props.requireRequiredTag) && Boolean(data?.me) && !isAdmin;
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

  const toggleRequiredTag = (tag) => {
    setSelectedRequiredTags(prev =>
      prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]
    );
  };

  const uploadFiles = async (event, slot, currentValue, setValue) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadError('');

    const existing = String(currentValue || '').split('|').filter(Boolean);
    const isVideo = file => (file.type || '').startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file.name);
    const videoFiles = files.filter(isVideo);
    const existingHasVideo = existing.some(url => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url));
    if (files.some(file => !file.type.startsWith('image/') && !isVideo(file))) {
      setUploadError('Можно загружать только изображения и видео.');
      event.target.value = '';
      return;
    }
    if ((videoFiles.length && (files.length !== 1 || existing.length)) || (existingHasVideo && files.length)) {
      setUploadError('Для одного блока выберите либо одно видео, либо изображения. Удалите текущие файлы перед заменой типа.');
      event.target.value = '';
      return;
    }
    if (videoFiles.some(file => file.size > 10 * 1024 * 1024)) {
      setUploadError('Размер видео не должен превышать 10 МБ.');
      event.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('slot', slot);
      if (props.postId) formData.append('postId', props.postId);
      files.forEach(file => formData.append('files', file));
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${getUploadBase()}/uploadpost`, {
        method: 'POST',
        headers: { Authorization: token },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось загрузить файлы.');
      setValue({ [slot]: [...existing, ...(result.urls || [])].join('|') });
    } catch (error) {
      setUploadError(error.message || 'Не удалось загрузить файлы.');
    } finally {
      event.target.value = '';
    }
  };

  const handleChangeFile = event => uploadFiles(event, 'imageUrl', imageUrl.imageUrl, setImageUrl);
  const handleChangeFile2 = event => uploadFiles(event, 'imageUrl2', imageUrl2.imageUrl2, setImageUrl2);
  const handleChangeFile3 = event => uploadFiles(event, 'imageUrl3', imageUrl3.imageUrl3, setImageUrl3);
  const handleChangeFile4 = event => uploadFiles(event, 'imageUrl4', imageUrl4.imageUrl4, setImageUrl4);
  const ihandleChangeFile = event => uploadFiles(event, 'iconPost', iconPost.iconPost, setIconPost);

  return (
    <Wrapper>
      {uploadError ? <p role="alert" style={{ color: '#b91c1c', padding: '0 1rem' }}>{uploadError}</p> : null}
      <Form
        onSubmit={event => {
          event.preventDefault();
          const customTagsArray = tags.tags ? tags.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
          const normalizedSelectedRequiredTags = selectedRequiredTags.map(tag => tag.trim()).filter(Boolean);
          const tagsArray = Array.from(new Set([...normalizedSelectedRequiredTags, ...customTagsArray]));

          if (requireRequiredTagSelection && normalizedSelectedRequiredTags.length === 0) {
            alert('Пожалуйста, выберите хотя бы один основной тег.');
            return;
          }

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
                ...body4,
                ...iconPost,
                ...imageUrl,
                ...imageUrl2,
                ...imageUrl3,
                ...imageUrl4,
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
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
              name="imageUrl"
              id="imageUrl"
              onChange={handleChangeFile}
              />

            {imageUrl.imageUrl && (
            <>
              <Button type="button" variant="contained" className='i-delete' onClick={() => setImageUrl({ imageUrl: '' })}>Удалить файл</Button>
              <p className="p-imageurl">{imageUrl.imageUrl}</p>
            </>
           )}

        </div>
        {imageUrl.imageUrl && (

            <div className="imageViewer">
              <PostMedia urls={imageUrl.imageUrl} />
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

      <label>Основные теги</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        {requiredTags.map(tag => {
          const isSelected = selectedRequiredTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleRequiredTag(tag)}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: isSelected ? '1px solid #0f766e' : '1px solid #cbd5e1',
                background: isSelected ? '#ccfbf1' : '#fff',
                color: isSelected ? '#115e59' : '#334155',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {requireRequiredTagSelection ? (
        <p style={{ marginTop: 8, fontSize: 12, color: '#b45309' }}>
          Выберите хотя бы один основной тег для новой записи.
        </p>
      ) : null}

      <div className="empty-div"></div>

      <label htmlFor="tags">Дополнительные теги (через запятую)</label>
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
                    <PostMedia urls={iconPost.iconPost} />
                  )}
            </div>
            <div className="iblock"  >   
            <input
              ref={iref}
              className="custom-icon-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff"
              name="iconPost"
              id="iconPost"
              onChange={ihandleChangeFile}
              />

            {iconPost.iconPost && (
            <>
              <Button type="button" variant="contained" className='i-delete' onClick={() => setIconPost({ iconPost: '' })}>Удалить</Button>
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
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
              name="imageUrl2"
              id="imageUrl2"
              onChange={handleChangeFile2}
              />

              {imageUrl2.imageUrl2 && (
              <>
                <Button type="button" className='i-delete' variant="contained" onClick={() => setImageUrl2({ imageUrl2: '' })}>Удалить файлы</Button>
                <p className="p-imageurl">{imageUrl2.imageUrl2}</p>
              </>
             )}
              </div>
            
            {imageUrl2.imageUrl2 && (

              <div className="imageViewer">
                <PostMedia urls={imageUrl2.imageUrl2} enableSlider />
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
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
              name="imageUrl3"
              id="imageUrl3"
              onChange={handleChangeFile3}
              />

              {imageUrl3.imageUrl3 && (
              <>
                <Button type="button" variant="contained" className='i-delete' onClick={() => setImageUrl3({ imageUrl3: '' })}>Удалить файлы</Button>
                <p className="p-imageurl">{imageUrl3.imageUrl3}</p>
              </>
             )}
              </div>
            {imageUrl3.imageUrl3 && (

              <div className="imageViewer">
                <PostMedia urls={imageUrl3.imageUrl3} enableSlider />
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

        <div className="empty-div"></div>
        <div className="imageUrl">
          <input
            className="custom-file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
            name="imageUrl4"
            id="imageUrl4"
            onChange={handleChangeFile4}
          />
          {imageUrl4.imageUrl4 && (
            <>
              <Button type="button" variant="contained" className="i-delete" onClick={() => setImageUrl4({ imageUrl4: '' })}>Удалить файлы</Button>
              <p className="p-imageurl">{imageUrl4.imageUrl4}</p>
              <PostMedia urls={imageUrl4.imageUrl4} enableSlider />
            </>
          )}
        </div>
        <label htmlFor="body4">Текстовый блок №4</label>
        <div className="style-simplemde">
          <SimpleMDE
            type="text"
            name="body4"
            id="body4"
            placeholder="Содержание"
            onChange={onChangeMDE4}
            value={body4.body4}
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
