import {
  types
} from './types'

function getAttribute(
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

function setAttribute(
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

function addAttribute(
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

function cloneDeep(
  value: Object | Array<any>
) {
  switch (types.getType(value)) {
    case types.typeNames.OBJECT:
      if (value.constructor.name !== 'Object') {
        break;
      }
      return Object.entries(value).reduce((obj, [key, objValue]) => {
        obj[key] = cloneDeep(objValue);
        return obj;
      }, {});
    case types.typeNames.ARRAY:
      return (value as any[]).map((item) => {
        return cloneDeep(item);
      });
  }
  return value;
}

const object = {
  getAttribute,
  setAttribute,
  addAttribute,
  cloneDeep
};

export {
  object
}
