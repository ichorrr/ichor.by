import React, { useRef, useEffect, useState, StrictMode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Vector2 } from "three";

import vertexShader from '../shaders/backshader/vertexShader';
import fragmentShader from '../shaders/backshader/backShader';
import useWindowSize from "./UseWindowSize";

const CLoader = () => {

  const ref = useRef();
  const { width, height } = useThree((state) => state.gl.domElement);
  const [size, setSize] = useState(() => ({ width: 0, height: 0 }));


const [uniforms, setUniforms] = useState(() => ({
    u_resolution: { type: "v2", value: new Vector2() },
    u_time: {type: 'f'},
  }));

  useEffect(() => {
     
    function onResize() {
      // get wrapper dimension without CSS transforms
      if (ref.current) {
        setSize({
          width: ref.width,
          height: ref.height
        });
      }
    }

    window.addEventListener("resize", onResize);
    
    onResize();

    function setPi(width, height) {
      window.innerWidth > window.innerHeight ? width = height : height = width;
      return width;
    }
  
      setUniforms((u) => ({
        ...u,
        u_resolution: {
          value: u.u_resolution.value.set(setPi(width, height)*(width/height) , setPi(width, height))
        }
      }));
    }, [width, height]);

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

const BgShader =() => {
  
  const windowSize = useWindowSize();
    return (
      <StrictMode>
      <div className="bg-canvas" >
      <Canvas>
        <CLoader />
      </Canvas>
      </div>
      <div className='black_bg'></div>
      </StrictMode>
    );
  }

export default BgShader;