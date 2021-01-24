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
  half?: number;
}

class QuadTree {

  bound: Rect;
  count: number;
  map: QuadTree[][];
  parent: QuadTree;
  protected _level: number;
  protected _nodes: QuadTree[];
  protected _objects: WorldObject[];
  protected _sector: number;

  constructor() {}

  initialize(
    size: number,
  ) {
    let binary = 2;
    let level = -2;
    while (binary < size) {
      ++level;
      binary *= 2;
    }
    const bound = { x1: 0, y1: 0, x2: binary, y2: binary };
    this.map = [];
    this._initialize(bound, level, this.map);
    const sector = this.map[0][0].bound;
    this._sector = sector.half * 2;
  }

  _initialize(
    bound: Rect,
    level: number,
    map: QuadTree[][],
    parent?: QuadTree
  ): QuadTree {
    this.count = 0;
    this.bound = bound;
    this._level = level;
    this.parent = parent;

    bound.xMid = (bound.x1 + bound.x2) * 0.5;
    bound.yMid = (bound.y1 + bound.y2) * 0.5;
    const size = bound.x2 - bound.x1;
    bound.half = size * 0.5;

    if (this._level > 0) {
      this._split(map);
    } else {
      this._objects = [];
      const column = this.bound.x1 / size;
      const row = this.bound.y1 / size;
      map[column] = map[column] || [];
      map[column][row] = this;
    }

    return this;
  }

  protected _split(
    map: QuadTree[][]
  ) {
    const level = this._level - 1;
    const { x1, y1, x2, y2, xMid, yMid } = this.bound;

    this._nodes = [
      new QuadTree()._initialize({ x1: x1, y1: y1, x2: xMid, y2: yMid }, level, map, this),
      new QuadTree()._initialize({ x1: xMid, y1: y1, x2: x2, y2: yMid }, level, map, this),
      new QuadTree()._initialize({ x1: x1, y1: yMid, x2: xMid, y2: y2 }, level, map, this),
      new QuadTree()._initialize({ x1: xMid, y1: yMid, x2: x2, y2: y2 }, level, map, this)
    ];
  }

  insert(
    object: WorldObject
  ) {
    const column = Math.floor(object.position.x / this._sector);
    const row = Math.floor(object.position.y / this._sector);
    this.map[column][row].add(object);
  }

  add(
    object: WorldObject
  ) {
    this._objects.push(object);
    let parent: QuadTree = this;
    do {
      ++parent.count;
    } while (parent = parent.parent);
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

    const { xMid, yMid, half } = this.bound;
    const length = half + radius;
    if (Math.abs(xMid - point.x) > length
      || Math.abs(yMid - point.y) > length
    ) {
      return;
    }

    if (this._level > 0) {
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
    if (this._level > 0) {
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
    if (this._level > 0) {
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
