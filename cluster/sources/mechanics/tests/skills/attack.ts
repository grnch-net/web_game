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

function test_attack() {
  console.group('Attack');

  const world = new World;
  world.initialize();

  const hero = new Character;
  const hero_parameters = Character.createParameters('hero');
  hero.initialize(hero_parameters);
  world.addCharacter(hero);

  const enemies: Character[] = [];
  for (let i = 0; i < 6; i++) {
    const enemy = new Character;
    const enemy_parameters = Character.createParameters('enemy');
    enemy.initialize(enemy_parameters);
    world.addCharacter(enemy);
    enemies.push(enemy);
  }

  hero.position.set(10, 0, 10);
  enemies[0].position.set(10, 0, 11);
  enemies[1].position.set(11, 0, 10);
  enemies[2].position.set(10, 0, 9);
  enemies[3].position.set(9, 0, 10);
  enemies[4].position.set(10, 0, 13);

  const target = enemies[0];
  const max_health = target.attributes.health.max;
  const max_stamina = hero.attributes.stamina.max;
  const attack_config = skillsConfig[SkillName.Attack];
  const damage = -attack_config.outerStaticInfluence.health;
  const cost = -attack_config.cost.stamina;

  hero.useSkill(SkillName.Attack);
  if (hero.attributes.stamina.value !== (max_stamina - cost)) {
    console.error('- Failed', hero.attributes.stamina.value, max_stamina, cost);
    console.groupEnd();
    return
  }
  if (target.attributes.health.value !== max_health) {
    console.error('- Failed', target.attributes.health.value, max_health, damage);
    console.groupEnd();
    return
  }
  world.tick(attack_config.castTime);
  world.update();
  if (target.attributes.health.value !== (max_health - damage)) {
    console.error('- Failed', target.attributes.health.value, max_health, damage);
    console.groupEnd();
    return
  }
  for (let i = 1; i < 6; i++) {
    if (enemies[i].attributes.health.value !== max_health) {
      console.error('- Failed', i, enemies[i].attributes.health.value, max_health);
      console.groupEnd();
      return
    }
  }

  console.info('- Successful');
  console.groupEnd();
}

export {
  test_attack
}
