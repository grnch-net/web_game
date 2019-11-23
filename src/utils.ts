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
