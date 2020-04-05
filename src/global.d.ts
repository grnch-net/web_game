import type * as three from 'three';
import type * as gltf from 'three/examples/jsm/loaders/GLTFLoader';
import type * as utils from './utils/index';

declare global {
  const THREE: typeof three;
  const GLTFLoader: typeof gltf.GLTFLoader;
  const GLTF: gltf.GLTF;
  const UTILS: typeof utils.UTILS;
}
