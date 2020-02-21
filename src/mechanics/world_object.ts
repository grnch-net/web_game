export class Point {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  set(
    x: number,
    y: number,
    z: number
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  lengthTo(
    point: Point
  ): number {
    const qX = (point.x - this.x) ** 2;
    const qY = (point.y - this.y) ** 2;
    const qZ = (point.z - this.z) ** 2;
    return Math.sqrt(qX + qY + qZ);
  }
}

export class WorldObject {
  world: any;
  position: Point;
  protected _rotation: number;

  get rotation(): number {
    return this._rotation;
  }

  set rotation(value: number) {
    this._rotation = value % (Math.PI * 2);
    if (this._rotation < 0) this._rotation += Math.PI * 2;
  }

  initialize(...args: any[]) {
    this.position = new Point();
    this._rotation = 0;
  }
}
