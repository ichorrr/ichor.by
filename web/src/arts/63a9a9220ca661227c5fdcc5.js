import { Canvas } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";
import styled from 'styled-components';

import vertexShader from '../shaders/vertexShader';
import fragmentShader from '../shaders/fragmentShader';

const BritPattern = () => {

  const mesh = useRef();
  const uniforms = useMemo(
    () => ({
      u_resolution: { value: new Vector2(1050, 1050) },
      u_time: { value: 1.0 },
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

const Arts63a9a9220ca661227c5fdcc5 =() => {
  return (
    <div className="htcanvas" >
    <Canvas>
      <BritPattern />
    </Canvas>
    </div>
  );
}

export default Arts63a9a9220ca661227c5fdcc5;
