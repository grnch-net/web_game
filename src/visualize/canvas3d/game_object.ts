import { DisplayObject } from './display_object';

const texture_loader = new THREE.TextureLoader();
const gltf_loader = new GLTFLoader();

export class GameObject extends DisplayObject {
  model: THREE.Scene;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer;

  load(
    path: string
  ) {
    return new Promise((resolve: any) => {
      gltf_loader.load(
        path + 'scene.gltf',
        gltf => this.initialize_model(resolve, gltf),
        undefined,
        (error: any) => console.error(error)
      );
    });
  }

  protected initialize_model(
    resolve: Function,
    gltf: typeof GLTF
  ) {
    this.model = gltf.scene;
    this.model.traverse((item: THREE.Object3D) => {
      if (!(item instanceof THREE.Mesh)) return
      item.castShadow = true;
      item.receiveShadow = false;
    });
    this.animations = gltf.animations;
    this.mixer = new THREE.AnimationMixer(this.model);
    resolve();
  }

  tick(dt: number) {
    this.mixer.update(dt);
  }
}
