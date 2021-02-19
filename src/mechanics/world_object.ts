import type {
  InteractionController
} from './interactions/index';

import {
  PointParameters,
  Point
} from './point';

interface WorldObjectParameters {
  position: PointParameters
}

class WorldObject {

  world: InteractionController;
  position: Point;
  direction: Point;
  wait: number;
  protected _rotation: number;

  get rotation(): number {
    return this._rotation;
  }

  set rotation(
    value: number
  ) {
    this._rotation = value % (Math.PI * 2);
    if (this._rotation < 0) this._rotation += Math.PI * 2;
    const x = -Math.sin(-this._rotation);
    const z = Math.cos(-this._rotation);
    this.direction.set(x, 0, z);
  }

  initialize(
    parameters: WorldObjectParameters,
    ...args: any[]
  ) {
    this.wait = 0;
    this.position = new Point(parameters.position);
    this.direction = new Point({ x: 0, y: 0, z: 0 });
    this.rotation = 0;
  }

  tick(
    dt: number
  ): number {
    dt += this.wait;
    this.wait = 0;
    return dt;
  }

}

export {
  WorldObjectParameters,
  WorldObject
};
