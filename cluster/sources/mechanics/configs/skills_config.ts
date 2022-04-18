import type {
  SkillConfig
} from '../skills/index';

type SkillsConfig = Associative<SkillConfig>;

enum SkillName {
  Recreation = 0,
  Attack = 1,
  Block = 2,
  Parry = 3,
  Throw = 4,
  Shot = 5
}

const skillsConfig: SkillsConfig = {
  [SkillName.Recreation]: {
    name: 'Recreation',
    usageTime: Infinity,
    innerGradualInfluence: {
      'health': 0.83
    }
  },
  [SkillName.Attack]: {
    name: 'Attack',
    specialClass: 'attack',
    reusable: true,
    castTime: 0,
    cost: {
      'stamina': -25
    },
    outerStaticInfluence: {
      'health': -10
    },
    stats: {
      penetration: 10
    }
  },
  [SkillName.Block]: {
    name: 'Block',
    specialClass: 'block',
    castTime: 0.5,
    usageTime: Infinity,
    stock: {
      'stamina': -10
    },
    stats: {
      penetration: 10,
      defense: 10
    }
  },
  [SkillName.Parry]: {
    name: 'Parry',
    specialClass: 'parry',
    castTime: 0.5,
    usageTime: Infinity,
    stock: {
      'stamina': -20
    }
  },
  [SkillName.Throw]: {
    name: 'Throw',
    // specialClass: 'throw', // TODO
    stock: {
      'stamina': -20
    }
  },
  [SkillName.Shot]: {
    name: 'Shot',
    specialClass: 'shot',
    stock: {
      'stamina': -10
    }
  }
};

export {
  SkillsConfig,
  SkillName,
  skillsConfig,
}
