import { Skill, SkillConfig, SkillParameters } from './skill';
import { Attack } from './specials/attack';
import { Block } from './specials/block';
import { skillsConfig } from '../configs/skills';

type ClassList = { [id: string]: typeof Skill };

export class utils {
  protected constructor() {}

  static specialClassList: ClassList = {
    attack: Attack,
    block: Block
  };

  static findConfig(
    id: string | number
  ): SkillConfig {
    return skillsConfig[id];
  }

  static findSpecialClass(
    specialId: string | number
  ): typeof Skill {
    return utils.specialClassList[specialId];
  }

  static create(
    parameters: SkillParameters
  ): Skill {
    const config = utils.findConfig(parameters.id);
    if (!config) {
      console.error('Can not find skill config with id:', parameters.id);
      return null;
    }
    let SkillClass = Skill;
    if (config.specialClass) {
      SkillClass = utils.findSpecialClass(config.specialClass);;
      if (!SkillClass) {
        console.error(
          'Can not find skill special class with id:',
          config.specialClass
        );
        return null;
      }
    }
    const skill = new SkillClass();
    skill.initialize(config, parameters);
    return skill;
  }
}
