import type {
  ItemParameters
} from '../../item/index';

import type {
  SkillConfig
} from '../../skills/index';

import {
  World
} from '../../world';

import {
  Character
} from '../../characters/character';

import {
  InventoryItemName,
  inventoryConfig
} from '../../configs/item_config';

function test_use_item() {
  console.group('Use');

  const world = new World;
  world.initialize();

  const hero = new Character;
  const hero_parameters = Character.createParameters('hero');
  hero_parameters.attributes.health.value = 1;
  const pie: ItemParameters = {
    id: InventoryItemName.Pie
  };
  const bag: ItemParameters = {
    id: InventoryItemName.SmallBag,
    inventory: [pie]
  };
  hero_parameters.equips.push(bag);
  hero.initialize(hero_parameters);
  world.addCharacter(hero);

  const max_value = hero.attributes.health.max;
  const item_skill_config = inventoryConfig[InventoryItemName.Pie].skill as SkillConfig;
  const regen = item_skill_config.innerGradualInfluence.health;

  hero.useInventoryItem(0, 0);
  world.tick(1);
  world.update();
  if (hero.attributes.health.value !== (1 + regen)) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick((max_value - 1) / regen - 2);
  world.update();
  if (hero.attributes.health.value !== (max_value - regen)) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return
  }
  world.tick(1);
  world.update();
  if (hero.attributes.health.value !== max_value) {
    console.error('Failed', hero.attributes.health.value);
    console.groupEnd();
    return;
  }

  console.info('Successful');
  console.groupEnd();
}

export {
  test_use_item
};