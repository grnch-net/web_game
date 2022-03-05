import {
  World
} from '../../world';

import {
  Character
} from '../../characters/character';

import {
  skillsConfig,
  SkillName
} from '../../configs/skills_config';

function test_recreation() {
  console.group('Recreation');
  const world = new World;
  world.initialize();

  const hero = new Character;
  const hero_parameters = Character.createParameters('hero');
  hero_parameters.attributes.health.value = 1;
  hero.initialize(hero_parameters);
  world.addCharacter(hero);

  const max_value = hero.attributes.health.max;
  const regen = skillsConfig[SkillName.Recreation].innerGradualInfluence.health;

  hero.useSkill(SkillName.Recreation);
  world.tick(1);
  world.update();
  if (hero.attributes.health.value !== (1 + regen)) {
    console.error('- Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick((max_value - 1) / regen - 2);
  world.update();
  if (hero.attributes.health.value !== (max_value - regen)) {
    console.error('- Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick(1);
  world.update();
  if (hero.attributes.health.value !== max_value) {
    console.error('- Failed', hero.attributes.health.value);
    console.groupEnd();
    return;
  }
  console.info('- Successful');
  console.groupEnd();
}

export {
  test_recreation
}
