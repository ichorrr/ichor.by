import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import UniBlock from '../components/UniBlock';
import { Canvas, useFrame } from "@react-three/fiber";
import { Stats, OrbitControls } from '@react-three/drei'
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

  const { loading, error, data } = useQuery( GET_FIRST_POST, IS_LOGGED_IN);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let idcat = data.postFirst.category._id;
  let iduser = data.postFirst.author._id;
console.log(data.postFirst);
  return (
    <article>
      <div className='iphone-canvas'>
      <Canvas camera={{ position: [10, 1, 5] }}>
      <ambientLight intensity={0.7} />
      <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, -5]} castShadow />
        <Model rotation={[0.3, Math.PI / 300.6, 0]}  position={[-2, -5, -1]} />
        <OrbitControls />
      </Canvas>
      </div>
    <div className="fPost">
      <div className="txtfPOst" >
          <Link to={`/posts/${data.postFirst._id}`}>
            <h1>{data.postFirst.title}</h1>
          </Link>
          <div className="css-plank">
            <Link  to={`/cats/${idcat}`}>
              {data.postFirst.category.catname}
            </Link>
            <Link  to={`/users/${iduser}`}>
              {`author ${data.postFirst.author.name}`}
            </Link>
          </div>
        </div>
        <div className="fp-canvas" >
          <UniBlock post={data.postFirst._id}/>
        </div>
      </div>
    </article>
  );
};

export default Fpost;
