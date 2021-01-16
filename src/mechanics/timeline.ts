class TimePoint {
  author: any;
  protected _enable: boolean = true;
  protected _complete: boolean = false;
  protected _value: number

  get enable(): boolean {
    return this._enable;
  }

  get complete(): boolean {
    return this._complete;
  }

  constructor(
    value: number
  ) {
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  tick(
    dt: number
  ) {
    this._value -= dt;
  }

  end() {
    this._value = 0;
    this._complete = true;
    this._enable = false;
  }

  disable() {
    this._enable = false;
  }
}

class Timeline {
  points: TimePoint[] = [];

  tick(
    dt: number
  ): { dt?: number, authors?: any[] } {
    if (!this.points.length) {
      return {};
    }
    const authors = [];
    while (this.points.length) {
      const point = this.points.last;
      if (!point.enable) {
        this.points.pop();
        continue;
      }
      if (point.value <= dt) {
        this.points.pop();
        authors.push(point.author);
        dt = point.value;
        point.end();
      }
      this._tick(dt, authors);
      break;
    }
    return { dt, authors };
  }

  protected _tick(
    dt: number,
    authors: any[]
  ) {
    if (!this.points.length) {
      return;
    }
    let index = this.points.length -1;
    for (; index > -1; index--) {
      const point = this.points[index];
      if (!point.enable) {
        this.points.splice(index, 1);
        continue;
      }
      if (point.value <= dt) {
        this.points.splice(index, 1);
        authors.push(point.author);
        point.end();
        continue;
      }
      point.tick(dt);
    }
  }

  addPoint(
    point: TimePoint
  ) {
    if (this.points.length == 0
      || this.points.last.value >= point.value
    ) {
      this.points.push(point);
      return;
    }
    for (const index in this.points) {
      if (this.points[index].value <= point.value) {
        this.points.splice(+index, 0, point);
        return;
      }
    }
  }

}

export {
  TimePoint,
  Timeline
}
