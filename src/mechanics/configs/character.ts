import { CharacterConfig } from '../character';

export const characterConfig: CharacterConfig = {
  attributes: {
    health: { max: 100 },
    stamina: { max: 150 }
  },
  counters: {
    armor: 0,
    experience: 0
  },
  effects: [
    {
      name: 'Inherent stamina regeneration',
      innerGradualInfluences: [
        {
          attribute: 'stamina',
          value: 5
        }
      ]
    }
  ],
  skills: [
    { id: 0 }
  ],
  equips: [],
  armorProtect: 0.9
};
