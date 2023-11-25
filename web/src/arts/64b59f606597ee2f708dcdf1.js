import { Canvas, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Vector2 } from "three";


import vertexShader from '../shaders/64b59f606597ee2f708dcdf1/vertexShader';
import fragmentShader from '../shaders/64b59f606597ee2f708dcdf1/fragmentShader';

const LabyRinths = () => {
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

  return (
    <mesh
      ref={ref} >
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
