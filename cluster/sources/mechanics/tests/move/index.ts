import {
  Point
} from '../../point';

import {
  World
} from '../../world';

import {
  Character
} from '../../characters/character';

function test_move() {
  console.group('Move');

  const world = new World;
  world.initialize();

  const hero = new Character;
  const hero_parameters = Character.createParameters('hero');
  hero.initialize(hero_parameters);
  world.addCharacter(hero);

  const test_parameters = [
  // direction  x   y   z
    [0,        10,  0, 11],
    [0.25,     11,  0, 11],
    [0.5,      11,  0, 10],
    [0.75,     11,  0,  9],
    [1,        10,  0,  9],
    [1.25,      9,  0,  9],
    [1.5,       9,  0, 10],
    [1.75,      9,  0, 11],
    [2,        10,  0, 11]
  ];

  const start_position = { x: 10, y: 0, z: 10 };

  for (const [direction, x, y, z] of test_parameters) {
    hero.updatePosition(start_position);
    hero.moveProgress(1, Math.PI * direction);
  
    const move_point = new Point({ x, y, z });
    const time_to_point = hero.position.lengthTo(move_point);
    world.tick(time_to_point);
    world.update();
  
    if (hero.position.x !== x
        || hero.position.y !== y
        || hero.position.z !== z
    ) {
      console.error('- Failed');
      console.error(`-- Direction: PI * ${direction}`);
      console.error(`-- Hero: ${hero.position.toString()}`);
      console.error(`-- Need: ${move_point.toString()}`);
      console.groupEnd();
      return;
    }
  }

  console.info('- Successful');
  console.groupEnd();
}

export {
  test_move
}