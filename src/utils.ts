export function getAttribute(
  target: any,
  path: string|string[]
) {
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

export function toArray(value: any) {
  return Array.isArray(value) ? value : [value];
}

export class Collection {
  list: any[];

  constructor(...options: any) {
    this.initialize(...options);
  }

  protected initialize(...options: any) {
    this.list = [];
  }

  add(item: any, ...options: any): boolean {
    if (this.list.includes(item)) {
      return false;
    }
    this.list.push(item);
    return true;
  }

  remove(item: any, ...options: any): boolean {
    if (!this.list.includes(item)) {
      return false;
    }
    const index = this.list.indexOf(item);
    this.list.splice(index, 1);
    return true;
  }
}
