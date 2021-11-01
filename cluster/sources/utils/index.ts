import type * as globalTypes from './global.d';
import { modifiable } from './modifiable';
import { customize } from './customize';
import { types } from './types';
import { object } from './object';
import { array } from './array';
import { Range } from './range';

const utils = (global as any).UTILS = {
  modifiable,
  customize,
  types,
  object,
  array,
  Range
};

declare global {
  const UTILS: typeof utils
}

export {
  modifiable,
  customize,
  types,
  object,
  array,
  Range
};
