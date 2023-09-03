import React, { useRef, useMemo, StrictMode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Vector2 } from "three";

import vertexShader from '../shaders/loader/vertexShader';
import fragmentShader from '../shaders/loader/loaderShader';

const CLoader = () => {
    const ref = useRef();
    const uniforms = useMemo(
        () => ({
            u_resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
            u_time: {type: 'f'},
    
        }), []);

    useFrame(({ clock }) => {
        ref.current.material.uniforms.u_time.value = clock.oldTime * 0.0005;
      });

    return (
        <mesh
        ref={ref}  >
          <planeGeometry args={[2., 2.]}  />
          <shaderMaterial
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            
          />
        </mesh>
      );
}

const Loader =() => {
    return (
      <StrictMode>
      <div className="loader-canvas" >
      <Canvas>
        <CLoader />
      </Canvas>
      </div>
      </StrictMode>
    );
  }

export default Loader;