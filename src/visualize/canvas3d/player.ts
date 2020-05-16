import { DisplayObject } from './display_object';
import { GameObject } from './game_object';
import  { Text } from './text';

type Action = (dt: number) => boolean;

export class Player extends DisplayObject {
  model: THREE.Group;
  camera: THREE.PerspectiveCamera;
  character: DisplayObject;
  renderer: THREE.Renderer;
  protected camera_pivot: THREE.Object3D;
  protected actions: Action[];
  protected fixed_camera: boolean;
  protected sensetive: number = 0.4;
  protected move_speed: number = 10;
  protected anim_walk: THREE.AnimationAction;

  initialize(
    camera: THREE.PerspectiveCamera,
    character: GameObject,
    renderer: THREE.Renderer
  ) {
    this.camera = camera;
    this.character = character;
    this.renderer = renderer;
    this.initialize_actions();
    this.camera.position.set(0, 15, -30);
    this.camera.rotation.set(Math.PI * 0.05, Math.PI, 0);
    this.camera_pivot = new THREE.Object3D;
    this.camera_pivot.add(this.camera);

    const name = new Text;
    const style = {
      fontSize: 80,
      color: 'white',
      stroke: 10
    };
    name.initialize('Player', style);
    name.model.position.y = 10;

    this.model = new THREE.Group;
    this.model.add(this.camera_pivot, this.character.model, name.model);

    this.anim_walk = character.mixer.clipAction(character.animations[1]);
    this.anim_walk.reset();
  }

  protected initialize_actions() {
    this.actions = [];
    this.initialize_watch();
    this.initialize_move();
  }

  protected initialize_watch() {
    let start_pos: number;
    let angle: number;
    const action = (dt: number) => {
      angle *= dt * this.sensetive;
      if (this.fixed_camera) {
        this.model.rotateY(angle);
      } else {
        this.camera_pivot.rotateY(angle);
      }
      return false;
    };
    const mouseover = (event: MouseEvent) => {};
    const mousemove = (event: MouseEvent) => {
      angle = -event.movementX;
      this.actions.push(action);
    };
    const touchstart = (event: TouchEvent) => {
      start_pos = event.touches[0].clientX;
    };
    const touchmove = (event: TouchEvent) => {
      angle = start_pos - event.touches[0].clientX;
      this.actions.push(action);
      start_pos = event.touches[0].clientX;
    };
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mouseover', mouseover);
    canvas.addEventListener('mousemove', mousemove);
    canvas.addEventListener('touchstart', touchstart);
    canvas.addEventListener('touchmove', touchmove);

    // const touchmove = (event: TouchEvent) => {
    //   angle = event.touches[0].clientX - start_pos;
    //   this.actions.push(action);
    //   start_pos = event.touches[0].clientX;
    // };
    // canvas.addEventListener('touchstart', event => {
    //   start_pos = event.touches[0].clientX;
    //   canvas.addEventListener('touchmove', touchmove);
    // });
    // canvas.addEventListener('touchend', () => {
    //   canvas.removeEventListener('touchmove', touchmove);
    // });
  }

  protected initialize_move() {
    const direction = new THREE.Vector3;
    let isMove = false;
    const action = (dt: number) => {
      if (!isMove) return false;
      this.model.translateOnAxis(direction, this.move_speed * dt);
      return true;
    };
    const movestart = () => {
      if (isMove) return;
      isMove = true;
      this.fixed_camera = true;
      this.model.quaternion.multiply(this.camera_pivot.quaternion);
      this.camera_pivot.quaternion.set(0, 0, 0, 1);
      this.actions.push(action);
      this.anim_walk.play();
    };
    const moveend = () => {
      if (direction.x != 0 || direction.z != 0) return;
      isMove = false;
      this.fixed_camera = false;
      const index = this.actions.indexOf(action);
      this.actions.splice(index, 1);
      this.anim_walk.stop();
    };
    document.addEventListener('touchstart', () => {
      direction.set(0, 0, 1);
      movestart();
    });
    document.addEventListener('touchend', () => {
      direction.set(0, 0, 0);
      moveend();
    });
    document.addEventListener('keydown', event => {
      if (event.key == 'w') {
        direction.z = 1;
      } else
      if (event.key == 's') {
        direction.z = -1;
      } else
      if (event.key == 'a') {
        direction.x = 1;
      } else
      if (event.key == 'd') {
        direction.x = -1;
      } else return;
      movestart();
    });
    document.addEventListener('keyup', event => {
      if (event.key == 'w') {
        if (direction.z != 1) return;
        direction.z = 0;
      } else
      if (event.key == 's') {
        if (direction.z != -1) return;
        direction.z = 0;
      } else
      if (event.key == 'a') {
        if (direction.x != 1) return;
        direction.x = 0;
      } else
      if (event.key == 'd') {
        if (direction.x != -1) return;
        direction.x = 0;
      } else return;
      moveend();
    });
  }

  tick(dt: number) {
    const actions = [];
    for (const action of this.actions) {
      action(dt) && actions.push(action);
    }
    this.actions = actions;
    this.character.tick(dt);
  }
}
