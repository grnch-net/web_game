import '../modifications/test_index';

import {
  test_quadtree
} from './quadtree/index';

import {
  test_effects
} from './effects/index';

import {
  test_skills
} from './skills/index';

console.group('test mechanics');
test_quadtree();
test_effects();
test_skills();
console.groupEnd();

// TODO:
// hero2.useInventoryItem(0);
// world.tick(1);
// console.info('hero2 health:', hero2.attributes.health.value);
