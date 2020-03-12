import { DisplayObject } from './display_object';

const texture_loader = new THREE.TextureLoader();
const gltf_loader = new GLTFLoader();

export class GameObject extends DisplayObject {
  model: THREE.Scene;
  material: THREE.Material;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer;
  protected load_resolve: any;

  load(
    path: string
  ) {
    return new Promise((resolve: any) => {
      this.load_resolve = resolve;
      this.load_textures(path + 'textures.png');
      this.load_model(path + 'scene.gltf');
    });
  }

  protected load_textures(path: string) {
    texture_loader.load(
      path,
      texture => this.initialize_material(texture),
      undefined,
      (error: any) => console.error(error)
    );
  }

  protected load_model(path: string) {
    gltf_loader.load(
      path,
      gltf => this.initialize_model(gltf),
      undefined,
      (error: any) => console.error(error)
    );
  }

  protected initialize_material(texture: THREE.Texture) {
    texture.flipY = false;
    this.material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xffffff,
      skinning: true
    });
    this.apply_material();
  }

  protected initialize_model(gltf: typeof GLTF) {
    this.model = gltf.scene;
    this.apply_material();

    this.animations = gltf.animations;
    this.mixer = new THREE.AnimationMixer(this.model);
  }

  protected apply_material() {
    if (!this.material || !this.model) return;
    this.model.traverse((item: THREE.Object3D) => {
      if (!(item instanceof THREE.Mesh)) return
      item.castShadow = true;
      item.receiveShadow = false;
      item.material = this.material;
    });
    this.load_resolve();
  }

  tick(dt: number) {
    this.mixer.update(dt);
  }
}
