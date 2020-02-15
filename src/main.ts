import World from './world';
import { Character, CharacterParameters } from './character';

const world = new World();
world.initialize();

const heroParameters: CharacterParameters = {
  attributes: {
    health: { value: 100 },
    stamina: { value: 1.5 },
    weariness: { value: 0 }
  },
  counters: {
    experience: 100
  },
  effects: [],
  skills: [],
  equips: [{
    id: 0,
    durability: { value: 98 }
  }, {
    id: 1,
    durability: { value: 50 }
  }]
};
const hero = new Character();
hero.initialize(heroParameters)

world.addCharacter(hero);
