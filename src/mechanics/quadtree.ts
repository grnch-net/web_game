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
}

class QuadTree {

  nodes: QuadTree[];
  objects: WorldObject[] = [];

  constructor(
    public bound: Rect,
    public capacity: number = 30
  ) {}

  insert(
    object: WorldObject
  ): boolean {
    if (this.bound.x1 > object.position.x
      || this.bound.x2 < object.position.x
      || this.bound.y1 > object.position.y
      || this.bound.y2 < object.position.y
    ) {
      return false;
    }

    if (this.nodes) {
      for (const node of this.nodes) {
        if (node.insert(object)) {
          return true;
        }
      }
      return false;
    }

    this.objects.push(object);
    if (this.objects.length > this.capacity) {
      this._split();
    }
    return true;
  }

  protected _split() {
    const { x1, y1, x2, y2 } = this.bound;
    const x_mid = (x1 + x2) * 0.5;
    const y_mid = (y1 + y2) * 0.5;

    this.nodes = [
      new QuadTree({ x1: x1, y1: y1, x2: x_mid, y2: y_mid }, this.capacity),
      new QuadTree({ x1: x_mid, y1: y1, x2: x2, y2: y_mid }, this.capacity),
      new QuadTree({ x1: x1, y1: y_mid, x2: x_mid, y2: y2 }, this.capacity),
      new QuadTree({ x1: x_mid, y1: y_mid, x2: x2, y2: y2 }, this.capacity)
    ];

    for (const object of this.objects) {
      for (const node of this.nodes) {
        if (node.insert(object)) {
          break;
        }
      }
    }
    this.objects = null;
  }

  getObjects(
    point: Point,
    radius: number,
    result: WorldObject[]
  ) {
    if (this.bound.x2 < point.x - radius
      || this.bound.x1 > point.x + radius
      || this.bound.y1 > point.y + radius
      || this.bound.y2 < point.y - radius
    ) {
      return;
    }

    if (this.nodes) {
      for (const node of this.nodes) {
        node.getObjects(point, radius, result);
      }
      return;
    }

    for (const object of this.objects) {
      if (point.lengthTo(object.position) <= radius) {
        result.push(object);
      }
    }
  }

}

export {
  QuadTree
};
