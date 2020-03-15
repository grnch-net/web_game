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
