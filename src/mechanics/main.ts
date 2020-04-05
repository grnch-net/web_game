import './modifications/index';
import { World } from './world';
import { Character, CharacterParameters } from './character';

export function test_mechanics() {
  const world = (window as any).world = new World();
  world.initialize();

  const heroParameters: CharacterParameters = {
    name: 'hero',
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {
      experience: 100
    },
    effects: [],
    skills: [
      { id: 1, experience: 0 },
      { id: 2, experience: 0 }
    ],
    equips: [
      {
        id: 0,
        equip:{
          durability: { value: 98 }
        }
      },
      {
        id: 1,
        equip: {
          durability: { value: 50 }
        }
      }
    ]
  };
  const hero = (window as any).hero = new Character();
  hero.initialize(heroParameters)
  world.addCharacter(hero);

  const hero2Parameters: CharacterParameters = {
    name: 'hero2',
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {
      experience: 100
    },
    effects: [],
    skills: [
      { id: 1, experience: 0 },
      { id: 2, experience: 0 }
    ],
    equips: [
        {
        id: 0,
        equip: {
          durability: { value: 98 }
        }
      },
      {
        id: 1,
        equip: {
          durability: { value: 50 }
        }
      }
    ]
  };
  const hero2 = (window as any).hero2 = new Character();
  hero2.initialize(hero2Parameters)
  world.addCharacter(hero2);


  hero2.position.set(0, 0, 1);
  hero2.rotation = Math.PI * 1;
  hero2.useSkill(2);
  hero.useSkill(1);
  world.tick(1);
}
