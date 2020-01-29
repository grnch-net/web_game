import World from './world';
import Character from './character';

const world = new World();

const parameters: any = {
  attributes: {
    health: { value: 100 },
    stamina: { value: 1.5 },
    weariness: { value: 0 }
  },
  counters: {
    experience: 100
  },
  effects: {},
  skills: {},
  equipments: [
    { id: 0, durability: 98 },
    { id: 1, durability: 50 }
  ]
};
const hero = new Character(parameters);

world.location.addCharacter(hero);
