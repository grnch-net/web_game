import { Container } from './container';
import type { Renderer } from './renderer';

export class Layer extends Container {
  model: THREE.Scene;
  camera: THREE.Camera;
  renderer: Renderer;
  protected width: number;
  protected height: number;

  initialize(
    width: number,
    height: number
  ) {
    super.initialize();
    this.width = width;
    this.height = height;
    this.initialize_camera();
  }

  protected initialize_model() {
    this.model = new THREE.Scene();
  }

  protected initialize_camera() {}

}
