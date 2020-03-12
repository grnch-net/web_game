import type { Container } from './container';

export abstract class DisplayObject {
  model: THREE.Object3D;
  parent: Container;

  tick(dt: number) {}
}
