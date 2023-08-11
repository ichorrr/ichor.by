
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("../dev/mobile.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={nodes.Cube.material}
        position={[-0.142, 0.013, -0.001]}
        scale={[1, 1, -0.36]}
      />
    </group>
  );
}

useGLTF.preload("../dev/mobile.glb");
