import './modifications/index';
import { World } from './world';
import { Character } from './character';
import { charactersParameters } from './configs/characters_parameters';

export function test_mechanics() {
  const world = (window as any).world = new World();
  world.initialize();

  const hero = (window as any).hero = new Character();
  hero.initialize(charactersParameters[0]);
  world.addCharacter(hero);

  const hero3 = (window as any).hero3 = new Character();
  hero3.initialize(charactersParameters[2]);
  world.addCharacter(hero3);

  const hero2 = (window as any).hero2 = new Character();
  hero2.initialize(charactersParameters[1]);
  world.addCharacter(hero2);

  enum SkillName {
    Attack = 1,
    Block = 2,
    Parry = 4,
    Shot = 5
  }

  hero2.position.set(0, 0, 1);
  hero2.rotation = Math.PI * 1;
  hero2.useSkill(SkillName.Block);

  // hero.useSkill(SkillName.Attack);
  hero3.useSkill(SkillName.Shot);

  // hero.useSkill(SkillName.Parry);
  // hero2.useSkill(SkillName.Attack);

  world.tick(3);
  console.info('hero2 health:', hero2.attributes.health.value);

  hero2.useInventoryItem(0);
  world.tick(1);
  console.info('hero2 health:', hero2.attributes.health.value);
}
