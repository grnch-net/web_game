import {
  QuadTree
} from '../../quadtree';

import {
  Character
} from '../../characters/character';

import {
  Point
} from '../../point';

function test_quadtree() {
  console.group('QuadTree');
  const bound = { x1: 0, y1: 0, x2: 100, y2: 100 };
  const tree = new QuadTree(bound);
  const objects = [];

  for (let i = 0; i < 1000; i++) {
    const hero = new Character;
    const parameters = Character.createParameters('hero');
    hero.initialize(parameters);
    hero.position.set(
      Math.floor(Math.random() * bound.x2),
      Math.floor(Math.random() * bound.y2),
      0
    );
    tree.insert(hero);
    objects.push(hero);
  }

  const point = new Point({ x: 50, y: 50, z: 0 });
  const result = [];

  const start = performance.now();
  tree.findByRadius(point, 5, result);
  const end = performance.now();
  console.info(end - start);

  for (const target of result) {
    (target as any).__hit = true;
  }

  for (const object of objects) {
    if (object.position.lengthTo(point) <= 5 && !(object as any).__hit) {
      console.error('Failed', object);
      console.groupEnd();
      return;    }
  }
  console.info('Successful');
  console.groupEnd();
}

export {
  test_quadtree
};
