import type {
  ItemParameters
} from '../../item/index';

import {
  World
} from '../../world';

import {
  Character
} from '../../characters/character';

import {
  InventoryItemName,
} from '../../configs/item_config';

import {
  EquipName,
  equipsConfig,
} from '../../configs/equips_config';

import {
  SkillName,
  skillsConfig
} from '../../configs/skills_config';



function test_equip_item() {
  console.group('Equip');

  const world = new World;
  world.initialize();

  const hero = new Character;
  const hero_parameters = Character.createParameters('hero');
  const sword: ItemParameters = {
    id: InventoryItemName.ShortSword
  };
  hero_parameters.equips.push(sword);
  hero.initialize(hero_parameters);
  world.addCharacter(hero);

  const enemy = new Character;
  const enemy_parameters = Character.createParameters('enemy');
  enemy.initialize(enemy_parameters);
  world.addCharacter(enemy);
  
  hero.position.set(10, 0, 10);
  enemy.position.set(10, 0, 11);

  const max_health = enemy.attributes.health.max;
  const attack_config = skillsConfig[SkillName.Attack];
  const sword_config = equipsConfig[EquipName.ShortSword];
  let damage = 0;
  damage += -attack_config.outerStaticInfluence.health;
  damage += sword_config.stats.meleeDamage;

  hero.useSkill(SkillName.Attack);
  if (sword_config.stats.speed > 0) {
    if (enemy.attributes.health.value !== max_health) {
      console.error('- Failed 1', {
        'target health': enemy.attributes.health.value,
        'target max health': max_health,
        damage
      });
      console.groupEnd();
      return
    }
    world.tick(sword_config.stats.speed);
    world.update();
  }
  if (enemy.attributes.health.value !== (max_health - damage)) {
    console.error('- Failed 2', {
      'target health': enemy.attributes.health.value,
      'target max health': max_health,
      damage
    });
    console.groupEnd();
    return
  }

  console.info('- Successful');
  console.groupEnd();
}

export {
  test_equip_item
};