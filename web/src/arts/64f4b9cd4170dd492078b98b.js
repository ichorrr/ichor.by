import { Canvas, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import { Vector2 } from "three";


import vertexShader from '../shaders/64b59f606597ee2f708dcdf1/vertexShader';
import fragmentShader from '../shaders/64b59f606597ee2f708dcdf1/fragmentShader';

const LabyRinths = () => {

  const mesh = useRef();

  const [width, height] = useWindowSize()
  const viewport = useThree();

   const [uniforms, setUniforms] = useState(() => ({
    u_resolution: { type: "v2", value: new Vector2() },
    u_time: {type: 'f'},
  }));

 useEffect(() => {
     
  function setPi(width, height) {
    width > height ? width = height : height = width;
    return width;
  }

    setUniforms((u) => ({
      ...u,
      u_resolution: {
        value: u.u_resolution.value.set(setPi(width, height) , setPi(width, height))
      }
    }));
  }, [width, height]);

  return (
    <mesh 
      ref={mesh}>
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
    <Canvas>
      <LabyRinths />
    </Canvas>
  );
}

export default Arts63addba80407bc4b94f5d964;
