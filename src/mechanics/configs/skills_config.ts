import type {
  SkillConfig
} from '../skills/index';

import {
  EquipSlot
} from '../equips/index';

type SkillsConfig = { [id: string]: SkillConfig };

const skillsConfig: SkillsConfig = {
  0: {
    name: 'Recreation',
    usageTime: Infinity,
    innerGradualInfluences: [
      {
        attribute: 'health',
        value: 0.83
      }
    ]
  },
  1: {
    name: 'Attack',
    specialClass: 'attack',
    reusable: true,
    castTime: 1,
    usageTime: 1,
    cost: [
      {
        attribute: 'stamina',
        value: 25
      }
    ],
    outerStaticInfluences: [
      {
        attribute: 'health',
        value: 10,
        negative: true
      }
    ]
  },
  2: {
    name: 'Block',
    specialClass: 'block',
    castTime: 0.5,
    usageTime: Infinity,
    stock: [
      {
        attribute: 'stamina',
        value: 10
      }
    ]
  },
  3: {
    name: 'Eat',
    useCount: 1,
    usageTime: 60,
    innerGradualInfluences: [
      {
        attribute: 'health',
        value: 2
      }
    ]
  },
  4: {
    name: 'Parry',
    specialClass: 'parry',
    castTime: 0.5,
    usageTime: Infinity,
    stock: [
      {
        attribute: 'stamina',
        value: 20
      }
    ]
  }
};

export {
  SkillsConfig,
  skillsConfig
}
