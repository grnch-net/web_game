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
  const parameters = Character.createParameters('hero1');
  parameters.attributes.health.value = 1;
  hero.initialize(parameters);
  world.addCharacter(hero);

  const maxValue = hero.attributes.health.max;
  const regen = skillsConfig[SkillName.Recreation].innerGradualInfluence.health;

  hero.useSkill(SkillName.Recreation);
  world.tick(1);
  if (hero.attributes.health.value !== (1 + regen)) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick((maxValue - 1) / regen - 2);
  if (hero.attributes.health.value !== (maxValue - regen)) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick(1);
  if (hero.attributes.health.value !== maxValue) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return;
  }
  console.info('Successful');
  console.groupEnd();
}

function test_attack() {
  console.group('Attack');
  const world = new World;
  world.initialize();
  const hero1 = new Character;
  const parameters1 = Character.createParameters('hero1');
  parameters1.skills.push({ id: SkillName.Attack })
  hero1.initialize(parameters1);
  world.addCharacter(hero1);
  const hero2 = new Character;
  const parameters2 = Character.createParameters('hero1');
  hero2.initialize(parameters2);
  hero2.position.set(0, 0, 1);
  world.addCharacter(hero2);

  const maxHealth = hero2.attributes.health.max;
  const maxStamina = hero1.attributes.stamina.max;
  const attack = skillsConfig[SkillName.Attack];
  const damage = -attack.outerStaticInfluence.health;
  const cost = -attack.cost.stamina;

  hero1.useSkill(SkillName.Attack);
  if (hero1.attributes.stamina.value !== (maxStamina - cost)) {
    console.error('Failed', hero1.attributes.stamina.value, maxStamina, cost);
    console.groupEnd();
    return
  }
  if (hero2.attributes.health.value !== maxHealth) {
    console.error('Failed', hero2.attributes.health.value, maxHealth, damage);
    console.groupEnd();
    return
  }
  world.tick(attack.castTime);
  if (hero2.attributes.health.value !== (maxHealth - damage)) {
    console.error('Failed', hero2.attributes.health.value, maxHealth, damage);
    console.groupEnd();
    return
  }
  console.info('Successful');
  console.groupEnd();
}

function test_block() {
  console.group('Block');
  const world = new World;
  world.initialize();
  const hero1 = new Character;
  const parameters1 = Character.createParameters('hero1');
  parameters1.skills.push({ id: SkillName.Attack })
  hero1.initialize(parameters1);
  world.addCharacter(hero1);
  const hero2 = new Character;
  const parameters2 = Character.createParameters('hero1');
  parameters2.skills.push({ id: SkillName.Block })
  hero2.initialize(parameters2);
  hero2.position.set(0, 0, 1);
  hero2.rotation = Math.PI * 1;
  world.addCharacter(hero2);

  const maxHealth = hero2.attributes.health.max;
  const maxStamina = hero1.attributes.stamina.max;
  const attack = skillsConfig[SkillName.Attack];
  const block = skillsConfig[SkillName.Block];
  const damage = -attack.outerStaticInfluence.health;
  const defense = block.stats.defense;
  const stock = -block.stock.stamina;

  hero2.useSkill(SkillName.Block);
  if (hero2.attributes.stamina.value !== maxStamina) {
    console.error('Failed', hero1.attributes.stamina.value, maxStamina);
    console.groupEnd();
    return
  }
  world.tick(block.castTime);
  hero1.useSkill(SkillName.Attack);
  world.tick(attack.castTime);
  if (hero2.attributes.stamina.value !== (maxStamina - stock)) {
    console.error('Failed', hero2.attributes.stamina.value, maxStamina, stock);
    console.groupEnd();
    return
  }
  if (hero2.attributes.health.value !== (maxHealth - damage + defense)) {
    console.error('Failed', hero2.attributes.health.value, maxHealth, damage);
    console.groupEnd();
    return
  }
  console.info('Successful');
  console.groupEnd();
}

function test_skills() {
  console.group('skill');
  test_recreation();
  test_attack();
  test_block();
  console.groupEnd();
}

export {
  test_skills
}
