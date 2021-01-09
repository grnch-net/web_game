import type {
  CharacterConfig
} from '../characters/character';

const characterConfig: CharacterConfig = {
  attributes: {
    health: { max: 100 },
    stamina: { max: 150 }
  },
  counters: {
    // experience: 0
  },
  effects: [
    { id: 0 }
  ],
  skills: [
    { id: 0 }
  ],
  equips: [],
  armorProtect: 0.9
};

export {
  characterConfig
}
