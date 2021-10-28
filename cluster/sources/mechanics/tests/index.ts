import './modifications';

import {
  test_quadtree
} from './quadtree/index';

import {
  test_effects
} from './effects/index';

import {
  test_skills
} from './skills/index';

import {
  test_inventory_items
} from './inventory/index';

console.group('test mechanics');
test_quadtree();
test_effects();
test_skills();
test_inventory_items();
console.groupEnd();