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
  value: any
): boolean {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  const attribute = path.pop();
  target = path.reduce((deep: any, key: string) => {
    return deep && deep[key];
  }, target);
  if (!target) return false;
  target[attribute] = value;
  return true;
}
