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

  const size = 1000;
  const tree = new QuadTree;
  tree.initialize(size);
  tree.clear();

  const objects = [];
  for (let i = 0; i < size; i++) {
    const hero = new Character;
    const parameters = Character.createParameters('hero');
    hero.initialize(parameters);
    hero.position.set(i, i, 0);
    tree.insert(hero);
    objects.push(hero);
  }

  const point = new Point({ x: 50, y: 50, z: 0 });
  const radius = 3;
  const result = tree.findByRadius(point, radius);

  if (result.length == 0) {
    console.error('Failed', point, radius);
  }

  for (const target of result) {
    (target as any).__hit = true;
  }

  for (const object of objects) {
    const lengthTo = object.position.lengthTo(point);
    const inner = lengthTo <= radius;
    const hit = (object as any).__hit;
    if ((inner && !hit) || (!inner && hit)) {
      console.error('Failed', !!(object as any).__hit, object.position, lengthTo, radius);
      console.groupEnd();
      return;
    }
  }

  // let time = Infinity;
  // for (let i = 0; i < 1000; i++) {
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
