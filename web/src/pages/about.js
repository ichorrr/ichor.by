import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {

    const navigate = useNavigate();
  
    useEffect(() => {
      document.title = 'About - ICHOR.BY';
    });

  
    return (
      <React.Fragment>

        <div className="top-new-post">
        <h1>What About Me</h1>
        </div>
        <p className='title-h2'>What skills did i use to create the project</p>
        <div className='tag-about'>
        <span>CSS</span><span>HTML</span><span>JS</span><span>REACT</span><span>WEBGL</span><span>FRAGMENT SHAIDER</span><span>THREE.JS</span><span>MONGODB</span><span>BLENDER</span><span>PHOTOSHOP</span><span>GIT</span><span>FIBER</span><span>3DSMAX</span>
        </div>
      </React.Fragment>
    );
  };
  
  export default About;