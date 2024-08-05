import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

    const navigate = useNavigate();
  
    useEffect(() => {
      document.title = 'About > ICHOR.BY';
    });

    let vurl = new URL( "../video/logo_output.mp4", import.meta.url );
    let vstr = "" + vurl;

    return (
      <React.Fragment>
        <div className="top-new-post">
        <H1R>What About Me</H1R>

        </div>
        <div className='block_about'>
            <div className='video_about'>
                <H2>3d modeling, creation of visual special effects for web ...</H2>
                <center>
                  <video src={vstr} autoPlay muted />
                </center>
            </div>
            <div className='txtColumn'>
                <p><b>Hello! It's my first post in this project. I welcome all visitors.</b> 
                  This site is my first application development and is intended to publish my works in the field of web application development. 
                  Despite the fact that the site is located in the .by domain zone, all my content is published in English - 
                  this is a form of consolidation and development of my skills, incl. in English. 
                  Guests can publish in any language they deem appropriate here.
                  This project will develop in parallel with my acquisition of new skills.
                </p>
            </div>
        <p className='title-h2'>What skills did i use to create the project</p>
        <div className='tag-about'>
        <span>CSS</span><span>HTML</span><span>JS</span><span>REACT</span><span>WEBGL</span><span>FRAGMENT SHAIDER</span><span>THREE.JS</span><span>MONGODB</span><span>BLENDER</span><span>PHOTOSHOP</span><span>GIT</span><span>FIBER</span><span>3DSMAX</span>
        </div>
        </div>
      </React.Fragment>
    );
  };
  
  export default About;