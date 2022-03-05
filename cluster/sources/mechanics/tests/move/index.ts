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
  // rotate          x   y  z
    [0,              10, 0, 11],
    [Math.PI * 0.25, 11, 0, 11],
    [Math.PI * 0.5,  11, 0, 10],
    [Math.PI * 0.75, 11, 0, 9],
    [Math.PI * 1,    10, 0, 9],
    [Math.PI * 1.25, 9,  0, 9],
    [Math.PI * 1.5,  9,  0, 10],
    [Math.PI * 1.75, 9,  0, 11],
    [Math.PI * 2,    10, 0, 11],
  ];

  for (const [rotate, x, y, z] of test_parameters) {
    hero.position.set(10, 0, 10);
    hero.rotate(rotate);
    hero.moveStart(0);
  
    const move_point = new Point({ x, y, z });
    const time_to_point = hero.position.lengthTo(move_point);
    world.tick(time_to_point);
    world.update();

    hero.moveStop();
  
    if (hero.position.x !== x
        || hero.position.y !== y
        || hero.position.z !== z
    ) {
      console.error('- Failed');
      console.error(`Rotation: PI * ${rotate / Math.PI}`);
      console.error(`Hero: ${hero.position.toString()}`);
      console.error(`Need: ${x}, ${y}, ${z}`);
      console.groupEnd();
      return
    }
  }

  console.info('- Successful');
  console.groupEnd();
}

export {
  test_move
}