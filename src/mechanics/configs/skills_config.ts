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
    innerGradualInfluence: {
      'health': 0.83
    }
  },
  1: {
    name: 'Attack',
    specialClass: 'attack',
    reusable: true,
    castTime: 1,
    usageTime: 1,
    cost: {
      'stamina': 25
    },
    outerStaticInfluence: {
      'health': -10
    }
  },
  2: {
    name: 'Block',
    specialClass: 'block',
    castTime: 0.5,
    usageTime: Infinity,
    stock: {
      'stamina': 10
    }
  },
  3: {
    name: 'Eat',
    useCount: 1,
    usageTime: 60,
    innerGradualInfluence: {
      'health': 2
    }
  },
  4: {
    name: 'Parry',
    specialClass: 'parry',
    castTime: 0.5,
    usageTime: Infinity,
    stock: {
      'stamina': 20
    }
  }
};

export {
  SkillsConfig,
  skillsConfig
}
