import { DisplayObject } from './display_object';

type Action = (dt: number) => void;

export class Player extends DisplayObject {
  model: THREE.Group;
  camera: THREE.PerspectiveCamera;
  character: DisplayObject;
  protected camera_pivot: THREE.Object3D;
  protected actions: Action[];
  protected fixed_camera: boolean;
  protected sensetive: number = 0.4;
  protected move_speed: any = 10;

  initialize(
    camera: THREE.PerspectiveCamera,
    character: DisplayObject
  ) {
    this.initialize_actions();
    this.camera = camera;
    this.character = character;
    this.camera.position.set(0, 15, -30);
    this.camera.rotation.set(Math.PI * 0.05, Math.PI, 0);
    this.camera_pivot = new THREE.Object3D;
    this.camera_pivot.add(this.camera);
    this.model = new THREE.Group;
    this.model.add(this.camera_pivot, this.character.model);
  }

  tick(dt: number) {
    for (const action of this.actions) {
      action(dt);
    }
    this.character.tick(dt);
  }

  protected initialize_actions() {
    this.actions = [];
    this.initialize_wath();
    this.initialize_move();
  }

  initialize_wath() {
    let start_pos: number;
    let angle: number;
    const action = (dt: number) => {
      angle *= dt * this.sensetive;
      if (this.fixed_camera) {
        this.model.rotateY(angle);
      } else {
        this.camera_pivot.rotateY(angle);
      }
      const index = this.actions.indexOf(action);
      this.actions.splice(index, 1);
    };
    const mouseover = (event: MouseEvent) => {
      start_pos = event.clientX;
    };
    const mousemove = (event: MouseEvent) => {
      angle = start_pos - event.clientX;
      this.actions.push(action);
      start_pos = event.clientX;
    };
    const touchstart = (event: TouchEvent) => {
      start_pos = event.touches[0].clientX;
    };
    const touchmove = (event: TouchEvent) => {
      angle = start_pos - event.touches[0].clientX;
      this.actions.push(action);
      start_pos = event.touches[0].clientX;
    };
    document.addEventListener('mouseover', mouseover);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('touchstart', touchstart);
    document.addEventListener('touchmove', touchmove);

    // const touchmove = (event: TouchEvent) => {
    //   angle = event.touches[0].clientX - start_pos;
    //   this.actions.push(action);
    //   start_pos = event.touches[0].clientX;
    // };
    // document.addEventListener('touchstart', event => {
    //   start_pos = event.touches[0].clientX;
    //   document.addEventListener('touchmove', touchmove);
    // });
    // document.addEventListener('touchend', () => {
    //   document.removeEventListener('touchmove', touchmove);
    // });
  }

  initialize_move() {
    const action = (dt: number) => {
      this.model.translateZ(dt * this.move_speed);
    };
    const touchstart = () => {
      this.fixed_camera = true;
      this.model.quaternion.multiply(this.camera_pivot.quaternion);
      this.camera_pivot.quaternion.set(0, 0, 0, 1);
      this.actions.push(action);
    };
    const touchend = () => {
      this.fixed_camera = false;
      const index = this.actions.indexOf(action);
      this.actions.splice(index, 1);
    };
    document.addEventListener('touchstart', touchstart);
    document.addEventListener('touchend', touchend);
  }
}
