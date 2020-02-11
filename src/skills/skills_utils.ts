import { Attributes } from '../interactions/index';
import { Skill, SkillConfig, SkillParameters } from './skill';
import { EquipSlot } from '../equips/index';
import { Attack } from './specials/attack';
import { Block } from './specials/block';

export class utils {
  protected constructor() {}

  static configs: ({ [id: string]: SkillConfig }) = {
    0: {
      name: 'Recreation',
      usageTime: Infinity,
      innerGradualInfluences: [
        {
          attribute: Attributes.Health,
          value: 0.003
        },
        {
          attribute: Attributes.Weariness,
          value: -0.003
        }
      ]
    },
    1: {
      name: 'Attack',
      specialClass: 'attack',
      castTime: 1,
      usageTime: 1,
      cost: [
        {
          attribute: Attributes.Stamina,
          value: 25
        }
      ],
      outerStaticInfluences: [
        {
          attribute: Attributes.Health,
          value: 10,
          negative: true
        }
      ],
      needs: {
        equips: [EquipSlot.MainHand, EquipSlot.SecondHand]
      }
    },
    2: {
      name: 'Block',
      specialClass: 'block',
      castTime: 0.5,
      usageTime: Infinity,
      stock: [
        {
          attribute: Attributes.Stamina,
          value: 25
        }
      ],
      needs: {
        equips: [EquipSlot.SecondHand]
      }
    }
  };

  static specialClassList: ({ [id: string]: typeof Skill }) = {
    attack: Attack,
    block: Block
  };

  static findConfig(
    id: string | number
  ): SkillConfig {
    const config = utils.configs[id];
    return config;
  }

  static findSpecialClass(
    specialId: string | number
  ): typeof Skill {
    const SpecialClass = utils.specialClassList[specialId];
    return SpecialClass;
  }

  static create(
    parameters: SkillParameters
  ): Skill {
    const config = utils.findConfig(parameters.id);
    if (!config) {
      console.error('Can not find skill config with id:', parameters.id);
      return null;
    }
    const { specialClass } = config;
    let SkillClass: typeof Skill;
    if (specialClass) {
      SkillClass = utils.findSpecialClass(specialClass);;
      if (!SkillClass) {
        console.error('Can not find skill special class with id:', specialClass);
        return null;
      }
    } else {
      SkillClass = Skill;
    }
    const skill = new SkillClass();
    skill.initialize(config, parameters);
    return skill;
  }
}
