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
  // rotate   direction        x   y   z
    [0,       0,              10,  0, 11],
    [0.25,    0,              11,  0, 11],
    [0.5,     0,              11,  0, 10],
    [0.75,    0,              11,  0,  9],
    [1,       0,              10,  0,  9],
    [1.25,    0,               9,  0,  9],
    [1.5,     0,               9,  0, 10],
    [1.75,    0,               9,  0, 11],
    [2,       0,              10,  0, 11],
    [0,       0.25,           11,  0, 11],
    [0.25,    0.25,           11,  0, 10],
    [0.25,    0.5,            11,  0,  9],
    [0,       1,              10,  0,  9],
    [0.25,    1,               9,  0,  9],
    [1,       0.5,             9,  0, 10],
    [1,       0.75,            9,  0, 11],
    [0,       2,              10,  0, 11]
  ];

  const start_position = { x: 10, y: 0, z: 10 };

  for (const [rotate, direction, x, y, z] of test_parameters) {
    hero.rotate(Math.PI * rotate);
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
      console.error(`-- Rotation: PI * ${rotate}`);
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