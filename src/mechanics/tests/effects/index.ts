import {
  World
} from '../../world';

import {
  Character
} from '../../characters/character';

import {
  EffectName,
  effectsConfig
} from '../../configs/effects_config';

function test_stamina_regeneration() {
  console.group('Inherent stamina regeneration');
  const world = new World;
  world.initialize();
  const hero = new Character;
  const parameters = Character.createParameters('hero1');
  parameters.attributes.stamina.value = 0;
  hero.initialize(parameters);
  world.addCharacter(hero);

  const maxValue = hero.attributes.stamina.max;
  const regen = effectsConfig[EffectName.InhStaminaRegen].innerGradualInfluence.stamina;

  world.tick(1);
  world.update();
  if (hero.attributes.stamina.value !== regen) {
    console.error('Failed', hero.attributes.stamina.value);
    console.groupEnd();
    return
  }
  world.tick(maxValue / regen - 2);
  world.update();
  if (hero.attributes.stamina.value !== (maxValue - regen)) {
    console.error('Failed', hero.attributes.stamina.value);
    console.groupEnd();
    return
  }
  world.tick(1);
  world.update();
  if (hero.attributes.stamina.value !== maxValue) {
    console.error('Failed', hero.attributes.stamina.value);
    console.groupEnd();
    return;
  }
  console.info('Successful');
  console.groupEnd();
}

function test_effects() {
  console.group('Effect');
  test_stamina_regeneration();
  console.groupEnd();
}

export {
  test_effects
}
