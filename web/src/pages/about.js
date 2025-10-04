import React, {useEffect} from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Message from '../components/Messages.js';
import { GET_ME } from '../gql/query';   

const H1R = styled.h1`
  color: #363636;
  font-size: 3em;
`;

const H2 = styled.h2`
  color: #fff;
  font-size: 2em;
  position: absolute;
  padding: 7em 0 0 3em;
  width: 400px;
  letter-spacing: .05em;
`;

const About = () => {

  useEffect(() => {
    document.title = 'О себе > ichor.by';
  });
  
    const navigate = useNavigate();
    
    const { loading, error, data } = useQuery(GET_ME, {
      onError: (error) => {
        console.error("Error fetching user data:", error);
        navigate('/login');
      }
    });

    if (loading) return <p>Loading...</p>;
    if (error) {
      console.error("Error fetching user data:", error);
      return <p>Error: {error.message}</p>;
    }
console.log(data.me);

    let vurl = new URL( "../video/logo_output.mp4", import.meta.url );
    let vstr = "" + vurl;

    return (
      <React.Fragment>
        <div className="top-new-post">
        <H1R>Что на счет меня?</H1R>
        <p>
          
          {data.me.family.map((family) => (
  <div key={family._id} className='family'>
    <a href={`/chat/${family._id}`}>
      <span className='family-name'>{family.name}</span>
    </a>
  </div>
))}
        </p>

     <Message />
        </div>
        <div className='block_about'>
            <div className='video_about'>
                <H2>3d modeling, creation of visual special effects for web ...</H2>
                <center>
                  <video src={vstr} autoPlay muted />
                </center>
            </div>
            <div className='txtColumn'>
                <p>Привет! Этот сайт является моей первой разработкой и служит платформой для публикации моих работ.
Этот проект будет развиваться параллельно с приобретением мной новых навыков.
                </p>
            </div>
        <p className='title-h2'>Мои скилсы использованные в проекте</p>
        <div className='tag-about'>
        <span>CSS</span><span>HTML</span><span>JS</span><span>REACT</span><span>WEBGL</span><span>FRAGMENT SHAIDER</span><span>THREE.JS</span><span>MONGODB</span><span>BLENDER</span><span>PHOTOSHOP</span><span>GIT</span><span>FIBER</span><span>3DSMAX</span>
        </div>
        </div>
      </React.Fragment>
    );
  };
  
  export default About;