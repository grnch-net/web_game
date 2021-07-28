import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from '../../inventory_object';

import {
  SkillConfig,
  Skill
} from '../../../skills/index';

type Mod = Modifiable<typeof InventoryObject>;

class InventoryObjectSkill extends (InventoryObject as Mod).Latest {

  initialize(
    config: InventoryObjectConfig,
    parameters: InventoryObjectParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_skill(config.skill, parameters);
  }

  initialize_skill(
    config: string | number | SkillConfig,
    parameters: InventoryObjectParameters
  ) {
    if (config === undefined) return;
    if (!parameters.skill) parameters.skill = {};
    this.skill = Skill.create(parameters.skill, config);
  }

}

(InventoryObject as Mod).modify(InventoryObjectSkill);
