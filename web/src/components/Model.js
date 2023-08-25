
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader.js'

const Model = (props) => {
  
  const ref = useRef()

  let url = new URL( "../models/iphone2.glb", import.meta.url );
  let str = "" + url;

  const { nodes, materials } = useGLTF(str)

  
  let turl = new URL( "../models/texture/scotish.jpg", import.meta.url );
  let tstr = "" + turl;

  const texture_1 = useLoader(TextureLoader, tstr)



  return (
    <group {...props} dispose={null} >
      <group
        position={[0.437, -1.021, 0.91]}
        rotation={[2.604, 0.236, 2.822]}
        scale={80}
      >
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.UCttAeyROPsgmix.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.rrqFqyfckTuyRuI.geometry}
            material={materials.CSNzlRnZuvCyxNL}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.XbtrdVaOWYmkEiU.geometry}
            material={materials.YiceMpFVTpnmoaq}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.YbXWdqEcjbfTKuN_0.geometry}
            material={materials.views}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.AbxQOpRbGREHXRG.geometry}
            material={materials.IDdMwJVCyuFpUnA}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.alSOKOYgFKIcUtR.geometry}
            material={materials.sWxYOtHGWTcXRMx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.FjhETOCBEeiBmch.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.lxsKwuOPNvmzBKg_0.geometry}
            material={materials.KhJiSWFcsscOusf}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.tWfjYtMZCfucxRt.geometry}
            material={materials.fdfRsQCrfvPBPfQ}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.aYjPeBrpBRopJbp.geometry}
            material={materials.xHgtbqndQshkTKG}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.BeQtuLXtpSTrzAH.geometry}
            material={materials.initialShadingGroup}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.KUDomTaVduCyevu.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.QaGkMzxNzKPcqRy.geometry}
            material={materials.iEhZxWeNLTDdgxm}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.QOfJIBEXOvXfSUh.geometry}
            material={materials.vsSJQngPxBJTVZb}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.RUMRNTkptJGDMpy.geometry}
            material={materials.LJBezuBxKRoHnAp}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.BDLCJBydsNjizog_0.geometry}
            material={materials.fGwijctGaiRaYJC}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.GWEiavWnRxbogtw_0.geometry}
            material={materials.FsunUcGyajFpQmW}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.JUTNJcWwqyxbGDZ_0.geometry}
            material={materials.LJBezuBxKRoHnAp}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.PLFTnNQeqVAxicS.geometry}
            material={materials.BLpVAsLWNICZYGG}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.RFqaqXLpuCDBIGV_0.geometry}
            material={materials.nJRBoEsOhzMSqCz}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.tWBbDznHihIxXam.geometry}
            material={materials.OStzgRHtVBLWwiD}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.aVmapfDgqkPkjUf.geometry}
            material={materials.WqbAhnIPgrrhfXS}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.CAQeTxdpUcbxQyT.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.lgnGJJmNebyRbHq_0.geometry}
            material={materials.rNCplyWedyfORFh}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.qsTxqfACkdoWeLQ.geometry}
            material={materials.IBtgGxCVyZhjKZM}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.tQCDizUpBYNcvFA.geometry}
            material={materials.LtesZnUOMbBEAoi}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.zPPSOvNamLQVyvv.geometry}
            material={materials.qEGySvwsouNnVcn}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.MoTJNOoMxqdxNvQ.geometry}
            material={materials.IBtgGxCVyZhjKZM}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.mZxrNiCtMrMjOMv.geometry}
            material={materials.WqbAhnIPgrrhfXS}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.YPGjoywokSeoQFr.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.rJeCWUNsVVXXAbI.geometry}
            material={materials.psePdsxZprlxGrw}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.rqSonbcVVSPWFfa_0.geometry}
            material={materials.jFPFAvCbiqflbQV}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.vauUojKrKkLLDtY.geometry}
            material={materials.HvAGJeQTAiWbceX}
            position={[0, 0, 1.435]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.wjSYkRykuFHJNPw.geometry}
            material={materials.KxzouvBYEgdZhMo}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.yqmgDmvGsmuPwXx_0.geometry}
            material={materials.bmOZLlCkCKhIIVe}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.dNDonqESZOxUcei_0.geometry}
            material={materials.LUbRMhkIhuekQRK}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.IuMgFUHIyRWENxG_0.geometry}
            material={materials.LcWBQfBvCzxThpp}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.nJYGEbPQybRBbiN.geometry}
            material={materials.tDZQoaroJfCIQtF}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.RGbIswEcCTzqNsn_0.geometry}
            material={materials.FlDKBWPodPcEeGy}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.XeFHhVBtRZWPGxR.geometry}
            material={materials.tfbCjiZQaZkmtHx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.JyAbjubWrOdfygC_0.geometry}
            material={materials.jFPFAvCbiqflbQV}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.nxFoHsySvfcSLvp.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.oCklTGvTZoDWJrC_0.geometry}
            material={materials.tfbCjiZQaZkmtHx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.BhvzCWikxrVeDTV.geometry}
            material={materials.LtesZnUOMbBEAoi}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.DLfIUIalXuQjJsL.geometry}
            material={materials.pBMikDFQfUOsKkr}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.ePYqawqlCJbCsNi.geometry}
            material={materials.CSNzlRnZuvCyxNL}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.FaUtifOQSMTXiZM.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.FGDSbHbILfUmiaH.geometry}
            material={materials.tfbCjiZQaZkmtHx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.jQXfQpudiYObSGp.geometry}
            material={materials.sWxYOtHGWTcXRMx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.KABLQLZRuEbcLWk.geometry}
            material={materials.fdfRsQCrfvPBPfQ}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.knexoFNknstHgiO.geometry}
            material={materials.KtvhjlxyToKjYkE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.MMkajxMNWrwGQfi.geometry}
            material={materials.LtesZnUOMbBEAoi}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.OMkeKbwVHRBkBwM.geometry}
            material={materials.IkWzRHNnDaKQXIi}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.qjXEDwnnBYwWcJn.geometry}
            material={materials.tfbCjiZQaZkmtHx}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.YnrVhXEUDbStWCs.geometry}
            material={materials.EJpkIDZfhPDUzel}
          />
        </group>
      </group>
    </group>
  )
}

export default Model;