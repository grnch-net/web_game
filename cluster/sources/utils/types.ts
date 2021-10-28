const typeNames = {
  OBJECT: 'Object',
  ARRAY: 'Array',
  STRING: 'String',
  NUMBER: 'Number',
  NULL: 'Null',
  UNDEFINED: 'Undefined',
  DATE: 'Date',
  FUNCTION: 'Function',
  ASYNC_FUNCTION: 'AsyncFunction'
};

function getType(
  obj: any
) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function isString(
  value: any
) {
  return getType(value) === typeNames.STRING;
}

function isNumber(
  value: any
) {
  return Number.isFinite(value);
}

function isArray(
  value: any
) {
  return Array.isArray(value);
}

function isObject(
  value: any
) {
  return getType(value) === typeNames.OBJECT;
}

function isFunction(
  value: any
) {
  const functionType = getType(value);
  return functionType === typeNames.FUNCTION || functionType === typeNames.ASYNC_FUNCTION;
}

function isBoolean(
  value: any
) {
  return typeof value == 'boolean';
}

const types = {
  typeNames,
  getType,
  isString,
  isNumber,
  isArray,
  isObject,
  isFunction,
  isBoolean
}

export {
  types
}
