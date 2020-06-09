import type {
  World
} from './world';

import {
  PointParameters,
  Point
} from './point';

interface WorldObjectParameters {
  position: PointParameters
}

class WorldObject {
  world: World;
  position: Point;
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
    this.position = new Point(parameters.position);
    this._rotation = 0;
  }
}

export {
  WorldObjectParameters,
  WorldObject
};
