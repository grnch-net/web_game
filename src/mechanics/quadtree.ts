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

  nodes: QuadTree[];
  count: number = 0;
  protected _objects: WorldObject[];

  constructor(
    public bound: Rect,
    public levels: number = 5,
    public parent?: QuadTree
  ) {
    bound.xMid = (bound.x1 + bound.x2) * 0.5;
    bound.yMid = (bound.y1 + bound.y2) * 0.5;
    bound.halfWidth = (bound.x2 - bound.x1) * 0.5;
    bound.halfHeight = (bound.y2 - bound.y1) * 0.5;

    if (this.levels) {
      this._split();
    } else {
      this._objects = [];
    }
  }

  insert(
    object: WorldObject
  ): boolean {
    ++this.count;

    if (!this.nodes) {
      this._objects.push(object);
      return true;
    }

    if (object.position.x < this.bound.xMid) {
      if (object.position.y < this.bound.yMid) {
        this.nodes[0].insert(object)
      } else {
        this.nodes[2].insert(object)
      }
    } else {
      if (object.position.y < this.bound.yMid) {
        this.nodes[1].insert(object)
      } else {
        this.nodes[3].insert(object)
      }
    }
    return true;
  }

  protected _split() {
    const levels = this.levels - 1;
    const { x1, y1, x2, y2, xMid, yMid } = this.bound;

    this.nodes = [
      new QuadTree({ x1: x1, y1: y1, x2: xMid, y2: yMid }, levels, this),
      new QuadTree({ x1: xMid, y1: y1, x2: x2, y2: yMid }, levels, this),
      new QuadTree({ x1: x1, y1: yMid, x2: xMid, y2: y2 }, levels, this),
      new QuadTree({ x1: xMid, y1: yMid, x2: x2, y2: y2 }, levels, this)
    ];
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

    const { xMid, yMid, halfWidth, halfHeight } = this.bound;
    const lengthX = Math.abs(xMid - point.x);
    if (lengthX > halfWidth + radius) {
      return;
    }
    const lengthY = Math.abs(yMid - point.y);
    if (lengthY > halfHeight + radius) {
      return;
    }

    if (lengthX < radius - halfWidth * 1.41
      && lengthY < radius - halfHeight * 1.41
    ) {
      this.get_objects(result);
      return;
    }

    if (this.nodes) {
      for (const node of this.nodes) {
        node.find_by_radius(point, radius, result);
      }
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
    if (this.nodes) {
      for (const node of this.nodes) {
        node.get_objects(result);
      }
    }
    result.push(...this._objects);
  }

}

export {
  QuadTree
};
