import { modifiable } from './modifiable';
import { customize } from './customize';
import { types } from './types';
import { object } from './object';
import * as array from './array';
import { wait } from './function';
import { Range } from './range';

declare const global, window;

const _global = global || window;

const utils = (_global as any).UTILS = {
  modifiable,
  customize,
  types,
  object,
  array,
  Range,
  wait
};

declare global {
  const UTILS: typeof utils;
  type Associative<T> = { [key: string]: T };
  type AnyClass = { new(...constructorArgs: any[]) };
  type List<T> = array.List<T>;
}

export {
  modifiable,
  customize,
  types,
  object,
  array,
  Range
};
