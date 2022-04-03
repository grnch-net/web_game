import type {
  Point
} from './point';

interface Rect {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  xMid?: number;
  zMid?: number;
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
  main: QuadTree<T>;
  parent: QuadTree<T>;
  protected _level: number;
  // protected _divisor: number;
  protected _nodes: QuadTree<T>[];
  protected _objects: T[];
  protected objects_map: T[][][];
  protected static_count: number;
  protected static_objects: T[];
  protected static_objects_map: T[][][];
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
    const bound = { x1: 0, z1: 0, x2: binary, z2: binary };
    this.map = [];
    this.objects_map = [];
    this.static_objects_map = [];
    this._initialize(bound, level, this);
    const sector = this.map[0][0].bound;
    this._sector = sector.half * 2;
  }

  _initialize(
    bound: Rect,
    level: number,
    main: QuadTree<T>,
    parent?: QuadTree<T>
  ): QuadTree<T> {
    this.isClear = true;
    this.count = 0;
    this.static_count = 0;
    this.bound = bound;
    this._level = level;
    this.parent = parent;
    this.main = main;
    // this._divisor = 1 / 2 ** (level + 3);

    bound.xMid = (bound.x1 + bound.x2) * 0.5;
    bound.zMid = (bound.z1 + bound.z2) * 0.5;
    const size = bound.x2 - bound.x1;
    bound.half = size * 0.5;

    if (this._level > 0) {
      this._split(main);
    } else {
      this._objects = [];
      this.static_objects = [];
      const column = this.bound.x1 / size;
      const row = this.bound.z1 / size;
      this.main.map[column] = this.main.map[column] || [];
      this.main.map[column][row] = this;
    }

    return this;
  }

  protected _split(
    main: QuadTree<T>
  ) {
    const level = this._level - 1;
    const { x1, z1, x2, z2, xMid, zMid } = this.bound;

    this._nodes = [
      new QuadTree<T>()._initialize({ x1: x1, z1: z1, x2: xMid, z2: zMid }, level, main, this),
      new QuadTree<T>()._initialize({ x1: xMid, z1: z1, x2: x2, z2: zMid }, level, main, this),
      new QuadTree<T>()._initialize({ x1: x1, z1: zMid, x2: xMid, z2: z2 }, level, main, this),
      new QuadTree<T>()._initialize({ x1: xMid, z1: zMid, x2: x2, z2: z2 }, level, main, this)
    ];
  }

  insert(
    object: T
  ) {
    if (this.parent) {
      throw new Error();
    }
    const column = Math.floor(object.position.x / this._sector);
    const row = Math.floor(object.position.z / this._sector);
    this.map[column][row].add(object);
  }

  insertStatic(
    object: T
  ) {
    if (this.parent) {
      throw new Error();
    }
    const column = Math.floor(object.position.x / this._sector);
    const row = Math.floor(object.position.z / this._sector);
    this.map[column][row].addStatic(object);
  }

  add(
    object: T
  ) {
    if (!this._objects) {
      throw new Error();
    }
    this._objects.push(object);
    const x = object.position.x - this.bound.x1;
    const z = object.position.z - this.bound.z1;
    this.main.objects_map[x] = this.main.objects_map[x] || [];
    this.main.objects_map[x][z] = this.main.objects_map[x][z] || [];
    this.main.objects_map[x][z].push(object);
    let parent: QuadTree<T> = this;
    do {
      ++parent.count;
      parent.isClear = false;
    } while (parent = parent.parent);
  }

  addStatic(
    object: T
  ) {
    if (!this._objects) {
      throw new Error();
    }
    this.static_objects.push(object);
    const x = object.position.x - this.bound.x1;
    const z = object.position.z - this.bound.z1;
    this.main.static_objects_map[x] = this.main.static_objects_map[x] || [];
    this.main.static_objects_map[x][z] = this.main.static_objects_map[x][z] || [];
    this.main.static_objects_map[x][z].push(object);
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

    const { x1, z1, x2, z2 } = this.bound;
    if (point.x < x1 || point.x >= x2 || point.z < z1 || point.z >= z2) {
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
    if (this.objects_map) {
      this.objects_map = [];
    }
    this._clear();
  }

  _clear() {
    if (this.isClear) {
      return;
    }
    this.isClear = true;
    this.count = this.static_count;
    if (this._level > 0) {
      this._nodes[0]._clear();
      this._nodes[1]._clear();
      this._nodes[2]._clear();
      this._nodes[3]._clear();
    } else {
      this._objects = [];
    }
  }

  findByDirection(
    point: Point,
    direction: Point,
    distance: number,
    result: T[] = []
  ): T[] {
    if (this.parent) {
      throw new Error();
    }
    const x2 = distance * direction.x + point.x;
    const z2 = distance * direction.z + point.z;
    this.findByLine(point.x, point.z, x2, z2, result);
    return result;
  }

  findByLine(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    result: T[] = []
  ): T[] {
    if (this.parent) {
      throw new Error();
    }
    const x_length = Math.abs(x1 - x2);
    const z_length = Math.abs(z1 - z2);
    let length = Math.max(x_length, z_length);

    const x_step = (x2 - x1) / length;
    const z_step = (z2 - z1) / length;

    let x = x1;
    let z = z1;
    this.findByPoint(x, z, result);

    while (length--) {
    	x += x_step;
    	z += z_step;
      this.findByPoint(Math.round(x), Math.round(z), result);
    }
    return result;
  }

  findByPoint(
    x: number,
    z: number,
    result: T[] = []
  ): T[] {
    const objects = this.main.objects_map[x][z];
    const static_objects = this.main.static_objects_map[x][z];
    result.push(...static_objects, ...objects);
    return result;
  }

}

export {
  QuadTree
};
