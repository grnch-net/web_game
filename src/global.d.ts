import type * as three from 'three';
import type * as gltf from 'three/examples/jsm/loaders/GLTFLoader';

declare global {
  const THREE: typeof three;
  const GLTFLoader: typeof gltf.GLTFLoader;
  const GLTF: gltf.GLTF;
}
