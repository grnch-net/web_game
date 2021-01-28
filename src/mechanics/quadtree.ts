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

interface TreeObject {
  position: Point
}

class QuadTree<T extends TreeObject> {

  isClear: boolean;
  bound: Rect;
  count: number;
  map: QuadTree<T>[][];
  parent: QuadTree<T>;
  protected _level: number;
  protected _nodes: QuadTree<T>[];
  protected _objects: T[];
  protected static_count: number;
  protected static_objects: T[];
  protected _sector: number;

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
    map: QuadTree<T>[][],
    parent?: QuadTree<T>
  ): QuadTree<T> {
    this.isClear = true;
    this.count = 0;
    this.static_count = 0;
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
      this.static_objects = [];
      const column = this.bound.x1 / size;
      const row = this.bound.y1 / size;
      map[column] = map[column] || [];
      map[column][row] = this;
    }

    return this;
  }

  protected _split(
    map: QuadTree<T>[][]
  ) {
    const level = this._level - 1;
    const { x1, y1, x2, y2, xMid, yMid } = this.bound;

    this._nodes = [
      new QuadTree<T>()._initialize({ x1: x1, y1: y1, x2: xMid, y2: yMid }, level, map, this),
      new QuadTree<T>()._initialize({ x1: xMid, y1: y1, x2: x2, y2: yMid }, level, map, this),
      new QuadTree<T>()._initialize({ x1: x1, y1: yMid, x2: xMid, y2: y2 }, level, map, this),
      new QuadTree<T>()._initialize({ x1: xMid, y1: yMid, x2: x2, y2: y2 }, level, map, this)
    ];
  }

  insert(
    object: T
  ) {
    this.isClear = false;
    const column = Math.floor(object.position.x / this._sector);
    const row = Math.floor(object.position.y / this._sector);
    this.map[column][row].add(object);
  }

  insertStatic(
    object: T
  ) {
    const column = Math.floor(object.position.x / this._sector);
    const row = Math.floor(object.position.y / this._sector);
    this.map[column][row].addStatic(object);
  }

  add(
    object: T
  ) {
    this._objects.push(object);
    let parent: QuadTree<T> = this;
    do {
      ++parent.count;
    } while (parent = parent.parent);
  }

  addStatic(
    object: T
  ) {
    this.static_objects.push(object);
    let parent: QuadTree<T> = this;
    do {
      ++parent.count;
      ++parent.static_count;
    } while (parent = parent.parent);
  }

  findByRadius(
    point: Point,
    radius: number,
    result: T[] = []
  ): T[] {
    this.find_by_radius(point, radius, result);
    return result;
  }

  find_by_radius(
    point: Point,
    radius: number,
    result: T[]
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

    for (const object of this.static_objects) {
      if (point.lengthTo(object.position) <= radius) {
        result.push(object);
      }
    }
  }

  getObjects(
    result: T[] = []
  ): T[] {
    this.get_objects(result);
    return result;
  }

  get_objects(
    result: T[]
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
    result.push(...this.static_objects, ...this._objects);
  }

  clear() {
    if (this.isClear) {
      return;
    }
    this.isClear = true;
    this.count = this.static_count;
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
