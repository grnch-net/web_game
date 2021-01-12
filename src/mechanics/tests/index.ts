import '../modifications/test_index';

import {
  test_effects
} from './effects/index';

import {
  test_skills
} from './skills/index';




console.group('test');
test_effects();
test_skills();
console.groupEnd();

// hero2.position.set(0, 0, 1);
// hero2.rotation = Math.PI * 1;
// hero2.useSkill(SkillName.Block);

// hero.useSkill(SkillName.Attack);
// hero3.useSkill(SkillName.Shot);

// hero.useSkill(SkillName.Parry);
// hero2.useSkill(SkillName.Attack);

// world.tick(3);
// console.info('hero2 health:', hero2.attributes.health.value);

// TODO:
// hero2.useInventoryItem(0);
// world.tick(1);
// console.info('hero2 health:', hero2.attributes.health.value);
