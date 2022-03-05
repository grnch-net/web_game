interface PointParameters {
  x: number;
  y: number;
  z: number;
}

class Point {

  constructor(
    protected parameters: PointParameters
  ) {};

  get x(): number {
    return this.parameters.x;
  };

  set x(value: number) {
    this.parameters.x = value;
  }

  get y(): number {
    return this.parameters.y;
  };

  set y(value: number) {
    this.parameters.y = value;
  }

  get z(): number {
    return this.parameters.z;
  };

  set z(value: number) {
    this.parameters.z = value;
  }

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

  toString(): string {
    return `{ x: ${this.x}, y: ${this.y}, z: ${this.z} }`;
  }

}

export {
  PointParameters,
  Point
};
