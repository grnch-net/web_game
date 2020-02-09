export function getAttribute(
  target: any,
  path: string|string[]
): any {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  return path.reduce((deep: any, key: string) => {
    return deep && deep[key];
  }, target);
}

export function setAttribute(
  target: any,
  path: string|string[],
  value: any,
  force: boolean = false
) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  const attribute = path.pop();
  target = path.reduce((deep: any, key: string) => {
    if (force) return deep[key] = deep[key] || {};
    else return deep && deep[key];
  }, target);
  target[attribute] = value;
}

export function addAttribute(
  target: any,
  path: string|string[],
  value: number,
  force: boolean = false
) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  const attribute = path.pop();
  target = path.reduce((deep: any, key: string) => {
    if (force) return deep[key] = deep[key] || {};
    else return deep && deep[key];
  }, target);
  if (force) {
    target[attribute] = target[attribute] || 0;
  }
  target[attribute] += value;
}

export function toArray(
  value: any
): any[] {
  return Array.isArray(value) ? value : [value];
}

export interface RangeArguments {
  max?: number,
  value?: number,
  min?: number
};

export class Range {
  protected _value: number;

  constructor(
    public max: number = 100,
    value?: number,
    public min: number = 0
  ) {
    if (value || value === 0) {
      this._value = value;
    } else {
      this._value = this.max;
    }
  }

  get value() { return this._value }
  set value(value: number) {
    if (value < this.min) this._value = this.min;
    else if (value > this.max) this._value = this.max;
    else this._value = value;
  }
}


export class Collection {
  list: any[];

  constructor(
    ...options: any
  ) {
    this.initialize(...options);
  }

  protected initialize(
    ...options: any
  ) {
    this.list = [];
  }

  add(
    item: any,
    ...options: any
  ): boolean {
    if (this.list.includes(item)) {
      return false;
    }
    this.list.push(item);
    return true;
  }

  remove(
    item: any,
    ...options: any
  ): boolean {
    if (!this.list.includes(item)) {
      return false;
    }
    const index = this.list.indexOf(item);
    this.list.splice(index, 1);
    return true;
  }
}
