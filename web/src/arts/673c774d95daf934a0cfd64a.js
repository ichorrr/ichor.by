import { Canvas, useThree, events } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Vector2 } from "three";
import { Stats, OrbitControls } from '@react-three/drei'

import vertexShader from '../shaders/673c774d95daf934a0cfd64a/vertexShader';
import fragmentShader from '../shaders/673c774d95daf934a0cfd64a/fragmentShader';

const BritPattern = () => {

  const mesh = useRef();
  const { width, height } = useThree((state) => state.gl.domElement);
  const [size, setSize] = useState(() => ({ width: 0, height: 0 }));


  const [uniforms, setUniforms] = useState(() => ({
    u_resolution: { type: "v2", value: new Vector2() },
    u_time: {type: 'f'},
  }));

  useEffect(() => {
     
    function onResize() {
      // get wrapper dimension without CSS transforms
      if (mesh.current) {
        setSize({
          width: mesh.width,
          height: mesh.height
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
          value: u.u_resolution.value.set((width, height)*(width/height) , setPi(width, height))
        }
      }));
    }, [width, height]);

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

const Arts673c774d95daf934a0cfd64a =() => {
  return (
    <div className="htcanvas" >
    <Canvas>
      <BritPattern />
      <OrbitControls />
    </Canvas>
    
    </div>
  );
}

export default Arts673c774d95daf934a0cfd64a;
