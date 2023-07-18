import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";
import styled from 'styled-components';


import vertexShader from '../shaders/64b59f606597ee2f708dcdf1/vertexShader';
import fragmentShader from '../shaders/64b59f606597ee2f708dcdf1/fragmentShader';

const LabyRinths = () => {

  const mesh = useRef();



  const uniforms = useMemo(
    () => ({
        u_resolution: { value: new Vector2(550, 550) },
        u_time: {type: 'f'},

    }), []);

  return (
    <mesh
      ref={mesh} >
      <planeGeometry args={[2., 2.]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Arts63addba80407bc4b94f5d964 =() => {
  return (
    <div className="htcanvas" >
    <Canvas>
      <LabyRinths />
    </Canvas>
    </div>
  );
}

export default Arts63addba80407bc4b94f5d964;
