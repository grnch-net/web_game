import type {
  CharacterConfig
} from '../characters/character';

import {
  SkillName
} from './skills_config';

import {
  EffectName
} from './effects_config';

const characterConfig: CharacterConfig = {
  attributes: {
    health: { max: 100 },
    stamina: { max: 150 }
  },
  counters: {},
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
  equips: [],
  armorProtect: 0.9
};

export {
  characterConfig
}
