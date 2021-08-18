import {
  ItemConfig,
  ItemParameters,
  Item
} from './item';

import {
  SkillConfig,
  Skill
} from '../skills/index';

type Mod = Modifiable<typeof Item>;

class ItemSkill extends (Item as Mod).Latest {

  initialize(
    config: ItemConfig,
    parameters: ItemParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_skill(config.skill, parameters);
  }

  initialize_skill(
    config: string | number | SkillConfig,
    parameters: ItemParameters
  ) {
    if (config === undefined) return;
    if (!parameters.skill) parameters.skill = {};
    this.skill = Skill.create(parameters.skill, config);
  }

}

(Item as Mod).modify(ItemSkill);
