import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";

import vertexShader from '../shaders/644d5f4cddda2a2f78cc00eb/vertexShader';
import fragmentShader from '../shaders/644d5f4cddda2a2f78cc00eb/fragmentShader';

const RainBow = () => {

  const mesh = useRef();

  const uniforms = useMemo(
    () => ({
        u_resolution: { value: new Vector2(1050, 1050) },
      u_time: {type: 'f'},

    }), []);

    useFrame(({ clock }) => {
      mesh.current.material.uniforms.u_time.value = clock.oldTime * 0.0001;
    });

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

const Arts644d5f4cddda2a2f78cc00eb =() => {
  return (
    <div className="htcanvas" >
    <Canvas>
      <RainBow />
    </Canvas>
    </div>
  );
}

export default Arts644d5f4cddda2a2f78cc00eb;
