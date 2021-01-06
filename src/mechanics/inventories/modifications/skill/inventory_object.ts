console.info('inventories/modifications/skill/inventory_object');

import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from '../../inventory_object';

import {
  SkillParameters,
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
    id: string | number,
    parameters: InventoryObjectParameters
  ) {
    if (id === undefined) return;
    if (!parameters.skill) parameters.skill = { id };
    this.skill = Skill.create(parameters.skill, id);
  }

}

(InventoryObject as Mod).modify(InventoryObjectSkill);
