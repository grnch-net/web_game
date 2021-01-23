import type {
  WorldObject
} from './world_object';

import type {
  Point
} from './Point';

interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xMid?: number;
  yMid?: number;
  halfWidth?: number;
  halfHeight?: number;
}

class QuadTree {

  bound: Rect;
  level: number;
  count: number = 0;
  protected _nodes: QuadTree[];
  protected _objects: WorldObject[];

  constructor() {}

  initialize(
    bound: Rect,
    level: number = 5,
  ) {
    this.bound = bound;
    this.level = level;

    bound.xMid = Math.ceil((bound.x1 + bound.x2) * 0.5);
    bound.yMid = Math.ceil((bound.y1 + bound.y2) * 0.5);
    const width = bound.x2 - bound.x1;
    const height = bound.y2 - bound.y1;
    bound.halfWidth = width * 0.5;
    bound.halfHeight = height * 0.5;

    if (width == 1 || height == 1) {
      this.level = 0;
    }

    if (this.level) {
      this._split();
    } else {
      this._objects = [];
    }
    return this;
  }

  protected _split() {
    const level = this.level - 1;
    const { x1, y1, x2, y2, xMid, yMid } = this.bound;

    this._nodes = [
      new QuadTree().initialize({ x1: x1, y1: y1, x2: xMid, y2: yMid }, level),
      new QuadTree().initialize({ x1: xMid, y1: y1, x2: x2, y2: yMid }, level),
      new QuadTree().initialize({ x1: x1, y1: yMid, x2: xMid, y2: y2 }, level),
      new QuadTree().initialize({ x1: xMid, y1: yMid, x2: x2, y2: y2 }, level)
    ];
  }

  insert(
    object: WorldObject
  ) {
    ++this.count;

    if (!this.level) {
      this._objects.push(object);
      return;
    }

    if (object.position.x < this.bound.xMid) {
      if (object.position.y < this.bound.yMid) {
        this._nodes[0].insert(object)
      } else {
        this._nodes[2].insert(object)
      }
    } else {
      if (object.position.y < this.bound.yMid) {
        this._nodes[1].insert(object)
      } else {
        this._nodes[3].insert(object)
      }
    }
  }

  findByRadius(
    point: Point,
    radius: number,
    result: WorldObject[] = []
  ): WorldObject[] {
    this.find_by_radius(point, radius, result);
    return result;
  }

  find_by_radius(
    point: Point,
    radius: number,
    result: WorldObject[]
  ) {
    if (!this.count) {
      return;
    }

    const {
      xMid,
      yMid,
      halfWidth,
      halfHeight
    } = this.bound;

    const lengthX = Math.abs(xMid - point.x);
    if (lengthX > halfWidth + radius) {
      return;
    }
    const lengthY = Math.abs(yMid - point.y);
    if (lengthY > halfHeight + radius) {
      return;
    }

    if (this.level) {
      this._nodes[0].find_by_radius(point, radius, result);
      this._nodes[1].find_by_radius(point, radius, result);
      this._nodes[2].find_by_radius(point, radius, result);
      this._nodes[3].find_by_radius(point, radius, result);
      return;
    }

    for (const object of this._objects) {
      if (point.lengthTo(object.position) <= radius) {
        result.push(object);
      }
    }
  }

  getObjects(
    result: WorldObject[] = []
  ): WorldObject[] {
    this.get_objects(result);
    return result;
  }

  get_objects(
    result: WorldObject[]
  ) {
    if (!this.count) {
      return;
    }
    if (this.level) {
      this._nodes[0].get_objects(result);
      this._nodes[1].get_objects(result);
      this._nodes[2].get_objects(result);
      this._nodes[3].get_objects(result);
      return;
    }
    result.push(...this._objects);
  }

  clear() {
    this.count = 0;
    if (this.level) {
      this._nodes[0].clear();
      this._nodes[1].clear();
      this._nodes[2].clear();
      this._nodes[3].clear();
    } else {
      this._objects = [];
    }
  }

}

export {
  QuadTree
};
