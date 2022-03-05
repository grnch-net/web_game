import type {
  CharacterConfig
} from '../characters/character';

import {
  SkillName
} from './skills_config';

import {
  EffectName
} from './effects_config';

import {
  InventoryItemName
} from './item_config';

import {
  EquipSlot
} from './equips_config';

const characterConfig: CharacterConfig = {
  moveForce: 1,
  slots: {
    [EquipSlot.Hold]: 2,
    [EquipSlot.Head]: 1,
    [EquipSlot.Body]: 1,
    [EquipSlot.Bag]: 1
  },
  attributes: {
    health: { max: 100 },
    stamina: { max: 150 }
  },
  // counters: {},
  effects: [
    { id: EffectName.InherentStaminaRegen }
  ],
  skills: [
    { id: SkillName.Recreation },
    { id: SkillName.Attack },
    { id: SkillName.Block },
    { id: SkillName.Throw },
    { id: SkillName.Shot },
  ],
  equips: []
};

// example
const characterParameters = {
  name: 'hero',
  position: { x: 0, y: 0, z: 0 },
  attributes: {
    health: { value: 100 },
    stamina: { value: 150 }
  },
  // counters: {},
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
};

export {
  characterConfig
};
