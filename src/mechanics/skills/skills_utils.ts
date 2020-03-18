import { InteractionUtils } from '../interactions/index';
import { Skill, SkillConfig, SkillParameters } from './skill';
import { skillsConfig, SkillsConfig } from '../configs/skills';
import { specialClassList } from './specials/index';

type ClassList = { [id: string]: typeof Skill };

export class utils extends InteractionUtils {
  static BaseClass: typeof Skill = Skill;
  static configs: SkillsConfig = skillsConfig;
  static specialClassList: ClassList = specialClassList;

  static findConfig(
    id: string
  ): SkillConfig {
    return super.findConfig(id) as SkillConfig;
  }

  static findSpecialClass(
    specialId: string
  ): typeof Skill {
    return super.findSpecialClass(specialId) as typeof Skill;
  }

  static create(
    parameters: SkillParameters,
    config?: SkillConfig
  ): Skill {
    return super.create(parameters, config) as Skill;
  }
}
