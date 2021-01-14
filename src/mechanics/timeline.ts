class TimePoint {
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
  }

  disable() {
    this._enable = false;
  }
}

class Timeline {
  points: TimePoint[] = [];

  tick(
    dt: number
  ): number {
    if (!this.points.length) {
      return;
    }
    let point: TimePoint;
    while(!point && this.points.length) {
      point = this.points.pop();
      if (!point.enable || point.value <= 0) {
        point = null;
      }
    }
    if (point) {
      if (dt < point.value) {
        this.points.push(point);
        point = null;
      } else {
        dt = point.value;
        point.end();
      }
      this._tick(dt);
    }
    return dt;
  }

  protected _tick(
    dt: number
  ) {
    if (!this.points.length) {
      return;
    }
    let index = this.points.length -1;
    for (; index > -1; index--) {
      const point = this.points[index];
      if (!point.enable || point.value <= 0) {
        this.points.splice(index, 1);
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
