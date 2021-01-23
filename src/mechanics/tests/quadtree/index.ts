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
  const bound = { x1: 0, y1: 0, x2: 1000, y2: 1000 };
  const tree = new QuadTree;
  tree.initialize(bound);
  tree.clear();
  const objects = [];
  const count = 1000;
  const ratioX = bound.x2 / count;
  const ratioY = bound.y2 / count;

  for (let i = 0; i < count; i++) {
    const hero = new Character;
    const parameters = Character.createParameters('hero');
    hero.initialize(parameters);
    hero.position.set(
      ratioX * i,
      ratioY * i,
      0
    );
    tree.insert(hero);
    objects.push(hero);
  }

  const point = new Point({ x: 50, y: 50, z: 0 });

  const radius = 13;
  const result = tree.findByRadius(point, radius);

  for (const target of result) {
    (target as any).__hit = true;
  }

  for (const object of objects) {
    const lengthTo = object.position.lengthTo(point);
    if (lengthTo <= radius && !(object as any).__hit) {
      console.error('Failed', !!(object as any).__hit, object.position, lengthTo, radius);
      console.groupEnd();
      return;
    }
  }

  // let time = Infinity;
  // for (let i = 0; i < 100; i++) {
  //   const start = performance.now();
  //   tree.clear();
  //   for (const object of objects) {
  //     tree.insert(object);
  //   }
  //   for (const object of objects) {
  //     tree.findByRadius(object.position, radius);
  //   }
  //   time = Math.min(time, performance.now() - start);
  // }
  // console.info(time);

  console.info('Successful');
  console.groupEnd();
}

export {
  test_quadtree
};
