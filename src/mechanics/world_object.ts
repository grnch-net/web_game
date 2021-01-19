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
  }

  initialize(
    parameters: WorldObjectParameters,
    ...args: any[]
  ) {
    this.wait = 0;
    this.position = new Point(parameters.position);
    this._rotation = 0;
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
