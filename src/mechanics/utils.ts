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

export function isNumber(
  value: number
) {
  return value || value === 0;
}

export interface RangeParameters {
  max?: number,
  value?: number,
  min?: number
}

export class Range {
  get max(): number {
    if (isNumber(this.parameters.max)) return this.parameters.max;
    if (isNumber(this.config.max)) return this.config.max;
    return 100;
  }

  set max(
    value: number
  ) {
    this.parameters.max = value;
    this.parameters.value = Math.min(this.value, value);
  }

  get min(): number {
    if (isNumber(this.parameters.min)) return this.parameters.min;
    if (isNumber(this.config.min)) return this.config.min;
    return 0;
  }

  set min(
    value: number
  ) {
    this.parameters.min = value;
    this.parameters.value = Math.max(this.value, value);
  }

  get value() {
    return this.parameters.value;
  }

  set value(
    value: number
  ) {
    if (value < this.min) this.parameters.value = this.min;
    else if (value > this.max) this.parameters.value = this.max;
    else this.parameters.value = value;
  }

  constructor(
    protected config: RangeParameters,
    protected parameters: RangeParameters
  ) {
    if (!isNumber(parameters.value)) {
      if (isNumber(config.value)) parameters.value = config.value;
      else parameters.value = this.max;
    }
  }
}
