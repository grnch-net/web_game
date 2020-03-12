import { DisplayObject } from './display_object';
import  { Text } from './text';

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
  }

  protected initialize_actions() {
    this.actions = [];
    this.initialize_wath();
    this.initialize_move();
  }

  protected initialize_wath() {
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

  protected initialize_move() {
    const direction = new THREE.Vector3;
    let count = 0;
    const action = (dt: number) => {
      this.model.translateOnAxis(direction, this.move_speed * dt);
    };
    const movestart = () => {
      count++;
      if (count > 1) return;
      this.fixed_camera = true;
      this.model.quaternion.multiply(this.camera_pivot.quaternion);
      this.camera_pivot.quaternion.set(0, 0, 0, 1);
      this.actions.push(action);
    };
    const moveend = () => {
      count--;
      if (count > 0) return;
      this.fixed_camera = false;
      const index = this.actions.indexOf(action);
      this.actions.splice(index, 1);
    };
    document.addEventListener('touchstart', () => {
      direction.set(0, 0, 1);
      movestart();
    });
    document.addEventListener('touchend', moveend);
    document.addEventListener('keydown', event => {
      if (event.code == 'KeyW') direction.z = 1;
      else if (event.code == 'KeyS') direction.z = -1;
      else if (event.code == 'KeyA') direction.x = 1;
      else if (event.code == 'KeyD') direction.x = -1;
      else return;
      movestart();
    });
    document.addEventListener('keyup', event => {
      if (event.code == 'KeyW') direction.z = 0;
      else if (event.code == 'KeyS') direction.z = 0;
      else if (event.code == 'KeyA') direction.x = 0;
      else if (event.code == 'KeyD') direction.x = 0;
      else return;
      moveend();
    });
  }

  tick(dt: number) {
    for (const action of this.actions) {
      action(dt);
    }
    this.character.tick(dt);
  }
}
