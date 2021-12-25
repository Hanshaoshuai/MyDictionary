import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import * as THREE from "three"; // 引入 Three.js 插件
// import banner from "../../../public/images/playground.glb"; // 引入全景图

const Pano = () => {
  const history = useHistory();
  const [domElement, setDomElement] = useState<any>([]);
  const renderer: any = new THREE.WebGLRenderer(); // 创建一个渲染器
  const scene: any = new THREE.Scene(); // 创建一个场景
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ); // 创建一个摄像机
  const geometry = new THREE.SphereBufferGeometry(100, 60, 40); // 创建一个球形的容器，用于贴全景图上去
  let material: any; // 贴图材质
  let mesh: any;

  useEffect(() => {
    geometry.scale(-1, 1, 1);
    let texture = new THREE.TextureLoader().load("/images/user__easyico.png");
    material = new THREE.MeshBasicMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = 1000;
    renderer.domElement.onclick = (e: any) => {
      if (e && !history?.location) {
        renderer.domElement.style.display = "none";
      }
    };
    document.body.appendChild(renderer.domElement);

    scene.add(mesh);

    camera.position.z = 300;

    window.addEventListener("resize", onWindowResize, false);

    animate();
    console.log(renderer);
  }, []);

  // 实现窗口大小改变的时候改变全景图的显示大小
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // 逐帧渲染
  const animate = () => {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  };

  return <div>{domElement}</div>;
};

export default Pano;
