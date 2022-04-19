import type {
  InteractionController
} from './interactions/index';

import {
  PointParameters,
  Point
} from './point';

interface WorldObjectParameters {
  initialized?: boolean;
  position: PointParameters;
  rotation?: number;
  moveForce?: number;
}

class WorldObject {

  world: InteractionController;
  id: number;
  position: Point;
  direction: Point;
  wait: number;
  protected parameters: WorldObjectParameters;
  protected move_direction: number;
  protected move_force: number;

  initialize(
    parameters: WorldObjectParameters,
    ...args: any[]
  ) {
    if (parameters.initialized) {
      console.error('World object parameters is initialized');
      return;
    }
    if (this.parameters) {
      console.error('World object is initialized.');
      return;
    }
    this._initialize(parameters, ...args);
  }

  protected _initialize(
    parameters: WorldObjectParameters,
    ...args: any[]
  ) {
    parameters.initialized = true;
    this.parameters = parameters;
    this.wait = 0;
    this.position = new Point(parameters.position);
    this.direction = new Point({ x: 0, y: 0, z: 0 });
    this.move_direction = 0;
    this.move_force = 0;
    this.rotate(parameters.rotation || 0);
  }

  destroy(): void {
    this.parameters.initialized = false;
    this.world = null;
  }

  tick(
    dt: number
  ): number {
    dt += this.wait;
    this.wait = 0;
    this.apply_move(dt);
    return dt;
  }

  protected apply_move(
    dt: number
  ): void {
    if (!this.move_force) {
      return;
    }
    this.position.x += this.direction.x * this.move_force * dt;
    this.position.y += this.direction.y * this.move_force * dt;
    this.position.z += this.direction.z * this.move_force * dt;
  }

  getRotation(): number {
    return this.parameters.rotation;
  }

  rotate(
    radian: number
  ) {
    radian = radian % (Math.PI * 2);
    if (radian < 0) radian += Math.PI * 2;
    this.parameters.rotation = radian;
  }

  protected update_direction(): void {
    let radian = this.move_direction;
    radian = radian % (Math.PI * 2);
    if (radian < 0) {
      radian += Math.PI * 2;
    }
    const x = -Math.sin(-radian);
    const z = Math.cos(-radian);
    this.direction.set(x, 0, z);
  }

  moveProgress(
    forcePercent?: number,
    direction?: number
  ): void {
    if (UTILS.types.isNumber(forcePercent)) {
      this.move_force = this.parameters.moveForce * forcePercent;
    }
    if (UTILS.types.isNumber(direction)) {
      this.move_direction = direction;
      this.update_direction();
    }
  }

  moveStop(): void {
    this.move_direction = 0;
    this.move_force = 0;
  }

  updatePosition(
    position: PointParameters
  ): void {
    this.position.copy(position);
  }

}

export {
  WorldObjectParameters,
  WorldObject
};
