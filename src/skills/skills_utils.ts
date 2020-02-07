import { attributes } from '../influences';
import { Skill, iConfig, iParameters } from './skill';
import { equipSlot } from '../equips/index';
import Block from './specials/block';

export default class utils {
  protected constructor() {}

  static configs: ({ [id: string]: iConfig }) = {
    0: {
      name: 'Recreation',
      usageTime: Infinity,
      innerGradualInfluences: [{
        attribute: attributes.health,
        value: 0.003
      }, {
        attribute: attributes.weariness,
        value: -0.003
      }]
    },
    1: {
      name: 'Attack',
      castTime: 1,
      cost: [{
        attribute: attributes.stamina,
        value: -25
      }],
      outerStaticInfluences: [{
        attribute: attributes.health,
        value: -10
      }]
    },
    2: {
      name: 'Block',
      specialClass: 'block',
      castTime: 0.5,
      usageTime: Infinity,
      stock: [{
        attribute: attributes.stamina,
        value: -25
      }],
      needs: {
        equip: equipSlot.secondHand
      }
    }
  }

  static specialClassList: ({ [id: string]: typeof Skill }) = {
    0: Block
  };

  static findConfig(
    id: string | number
  ): iConfig {
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
    parameters: iParameters
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
    const skill = new SkillClass(config, parameters);
    return skill;
  }
}
