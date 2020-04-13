import {
  Skill,
  SkillConfig,
  SkillParameters
} from './skill';

import {
  skillsConfig
} from '../configs/skills_config';

import {
  InteractionUtils
} from '../interactions/index';

class SkillsUtils extends InteractionUtils {
  static BaseClass = Skill;
  static configs = skillsConfig;

  static findConfig(
    id: string
  ): SkillConfig {
    return super.findConfig(id) as SkillConfig;
  }

  static findSpecialClass(
    id: string
  ): typeof Skill {
    return Skill.customs[id] as typeof Skill;
  }

  static create(
    parameters: SkillParameters,
    id?: string | number
  ): Skill {
    if (!id && id !== 0) {
      id = parameters.id;
    }
    return super.create(parameters, id) as Skill;
  }
}

export {
  SkillsUtils
}
