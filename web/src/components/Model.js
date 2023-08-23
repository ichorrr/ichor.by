
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

const Model = (props) => {
  
  let url = new URL( "../../public/mobile.glb", import.meta.url );
  let str = "" + url;

  const { nodes, materials } = useGLTF(str)
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cube.geometry} material={nodes.Cube.material} position={[-0.142, 0.013, -0.001]} scale={[1, 1, -0.36]} />
    </group>
  )
}

export default Model;


