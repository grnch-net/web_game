import * as three from 'three';
declare const THREE: typeof three;

const screen_width = window.innerWidth;
const screen_height = window.innerHeight;

const renderer = (window as any).renderer = new THREE.WebGLRenderer();
renderer.setSize(screen_width, screen_height);
document.body.appendChild(renderer.domElement);

const scene = (window as any).scene = new THREE.Scene();

const camera = (window as any).camera = new THREE.PerspectiveCamera();
camera.aspect = screen_width / screen_height;
camera.updateProjectionMatrix();
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );


function animator() {
  mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animator);
}
animator();

import { GLTFLoader as gltfloader } from 'three/examples/jsm/loaders/GLTFLoader';
declare const GLTFLoader: typeof gltfloader;

const loader = new GLTFLoader();
// loader.load(
//   'res/char/scene.gltf',
//   (gltf: any) => scene.add(gltf.scene),
//   (xhr: any) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
//   (error: any) => console.error(error)
// );
