import React, { Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import UniBlock from '../components/UniBlock';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage } from '@react-three/drei'
import Model from './Model'

const GET_FIRST_POST = gql`
  query postFirst {
    postFirst {
      _id
      title
      scriptUrl
      viewsCount
      category {
        _id
        catname
      }
      author {
        _id
        name
      }
    }
  }
`;

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const PostParagraph = styled.div`
    background-color: #dae6f7;
    width: 100%;
    display: block;
    margin-bottom: 1em;
`;

const PostBlock = styled.div`
  padding-bottom: 4em;
  display: block;
`;


const Fpost = ({post}) => {
  const ref = useRef()
  const { loading, error, data } = useQuery( GET_FIRST_POST, IS_LOGGED_IN);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let idcat = data.postFirst.category._id;
  let iduser = data.postFirst.author._id;
console.log(data.postFirst);
  return (
    <article>
      <div className='iphone-canvas'>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage controls={ref} preset="rembrandt" intensity={1}  environment="city">
        false
          <Model />
        false
        </Stage>
      </Suspense>
      <OrbitControls ref={ref} autoRotate enableZoom={false}/>
    </Canvas>
      </div>
    <div className="fPost">
      <div className="txtfPOst" >
          <Link to={`/posts/${data.postFirst._id}`}>
            <h1>{data.postFirst.title}</h1>
          </Link>
          <p><br></br><br></br></p>
          <div className="css-plank">
            <Link  to={`/cats/${idcat}`}>
              {data.postFirst.category.catname}
            </Link>
            <Link  to={`/users/${iduser}`}>
              {`author ${data.postFirst.author.name}`}
            </Link>
          </div>
        </div>
          <UniBlock post={data.postFirst._id}/>
      </div>
    </article>
  );
};

export default Fpost;
