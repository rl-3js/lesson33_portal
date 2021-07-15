import "./style.css";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import fireFliesFragment from './shaders/fireFlies/fragment.glsl'
import fireFliesShaderVertex from './shaders/fireFlies/vertex.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400
});

const debugObject = {}

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Object
 */

// Texture
const bakedTexture = textureLoader.load("mymodels/baked3.jpg");
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;
// Materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const portalMaterial = new THREE.MeshBasicMaterial({color:"white"})
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })



// Model
gltfLoader.load("mymodels/land5.glb", (mdoel) => {
//   mdoel.scene.traverse((child) => {
//     console.log(child.name)
//     child.material = bakedMaterial;
//   });

  // console.log(mdoel.scene.children)
  const bakedMesh = mdoel.scene.children.find( (child) => child.name == "baked");
  const poleLightMesh = mdoel.scene.children.find( (child) => child.name == "LightRIght");
  const poleRightMesh = mdoel.scene.children.find( (child) => child.name == "LightLEft");
  const portalMesh = mdoel.scene.children.find( (child) => child.name == "POrtal");

  bakedMesh.material = bakedMaterial
  poleLightMesh.material = poleLightMaterial
  poleRightMesh.material = poleLightMaterial
  portalMesh.material = portalMaterial

  console.log(poleLightMesh);
  scene.add(mdoel.scene);
});

// Geometry 
const firefliesGeometry = new THREE.BufferGeometry()
const fliesCount = 30
const fliesPosition = new Float32Array(fliesCount * 3)
const fliesScale = new Float32Array(fliesCount)


for(let i =0; i< fliesCount; i++){
    fliesPosition[i*3] =     (Math.random() - 0.5) * 4
    fliesPosition[i*3 + 1] = Math.random() * 1.5
    fliesPosition[i*3 + 2] = (Math.random() - 0.5) * 4
    fliesScale [i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(fliesPosition,3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(fliesScale,1))

// Material
const fireFliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {value : 0.0},
    uPixelRatio : { value : Math.min(window.devicePixelRatio,2)},
    uSize: { value: 100.0}
  },
  vertexShader:fireFliesShaderVertex,
  fragmentShader: fireFliesFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

gui.add(fireFliesMaterial.uniforms.uSize,"value").min(0.1).max(200).step(1).name("fireFliesSize")

// Points
const fireFlies = new THREE.Points(firefliesGeometry,fireFliesMaterial)

scene.add(fireFlies)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => {

 // Update fireflies
 fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio,2)

  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
debugObject.clearColor = "#201919"
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject,'clearColor').onChange( color => renderer.setClearColor(color))
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  fireFliesMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
