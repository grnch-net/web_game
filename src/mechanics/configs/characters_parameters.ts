import type {
  CharacterParameters
} from '../characters/character';

import {
  SkillName
} from './skills_config';

import {
  EffectName
} from './effects_config';

import {
  InventoryItemName
} from './inventory_config';

type CharactersParameters = { [id: string]: CharacterParameters };

const charactersParameters: CharactersParameters = {
  0: {
    name: 'hero',
    position: { x: 0, y: 0, z: 0 },
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {},
    effects: [
      { id: EffectName.Lucky }
    ],
    skills: [
      { id: SkillName.Parry }
    ],
    equips: [
      {
        id: InventoryItemName.ShortSword,
        equip: { durability: 98 }
      }
    ]
  }
};

export {
  charactersParameters
}
