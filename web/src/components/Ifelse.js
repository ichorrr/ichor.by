import React,  {Component, useRef, Suspense, lazy } from 'react';
import { useQuery, gql } from '@apollo/client';
import {Canvas} from "@react-three/fiber";
const Arts63a9a9220ca661227c5fdcc5 = lazy(() => import('../arts/63a9a9220ca661227c5fdcc5'));
const Arts644d5f4cddda2a2f78cc00eb = lazy(() => import('../arts/644d5f4cddda2a2f78cc00eb'));
const Arts64b59f606597ee2f708dcdf1 = lazy(() => import('../arts/64b59f606597ee2f708dcdf1'));
class ArtPage extends React.Component {

  render() {
    let csc = this.props.id;
    const Pt = document.getElementById(`${csc}`);

    if (csc == "64b59f606597ee2f708dcdf1") {
            return (
        <Suspense fallback={<div>Loading...</div>}>
          <Arts64b59f606597ee2f708dcdf1 /> 
        </Suspense>
      )}

    if (csc == "64bc31b1de84de04f04768fb") {

      return (
        <Suspense fallback={<div>Loading...</div>}>
          <Arts63a9a9220ca661227c5fdcc5 />
        </Suspense>
      )}

      if (csc == "64bc3545de84de04f04768fc") {

        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Arts644d5f4cddda2a2f78cc00eb />
          </Suspense>
        )}

      if (csc == "64b59f606597ee2f708dcdf1") {

        let lth = "<div style='background: #000;'><H1>WELCOME</H1></div>" +
        "<div><h2>MEGA DEN</h2></div>"
        Pt.innerHTML = lth;

        return (
          <div id="canvas-container">
            <Canvas>
            <pointLight position={[3, 1, 3]} />
              <mesh position={[5, 1, 3]}>
                <sphereGeometry />
                <meshStandardMaterial color="red" />
              </mesh>
            </Canvas>
          </div>
        )}
  }};

export default ArtPage;
