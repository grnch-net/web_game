import type * as globalTypes from './global.d';
import { modifiable } from './modifiable';
import { customize } from './customize';
import { types } from './types';
import { object } from './object';
import * as array from './array';
import { wait } from './function';
import { Range } from './range';

const utils = (global as any).UTILS = {
  modifiable,
  customize,
  types,
  object,
  array,
  Range,
  wait
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
