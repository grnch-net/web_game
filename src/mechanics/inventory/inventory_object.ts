import {
  SkillParameters,
  Skill,
  SkillsUtils
} from '../skills/index';

import {
  EquipParameters,
  Equip,
  EquipsUtils
} from '../equips/index';

import {
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

interface InventoryObjectConfig extends InteractionConfig {
  skill?: string | number;
  equip?: string | number;
}

interface InventoryObjectParameters extends InteractionParameters {
  id: string | number;
  name?: string;
  skill?: SkillParameters;
  equip?: EquipParameters;
}

class InventoryObject extends InteractionObject {
  equip: Equip | null;
  skill: Skill | null;
  protected config: InventoryObjectConfig;
  protected parameters: InventoryObjectParameters;

  get name(): string {
    return this.config.name;
  }

  get customName(): string {
    return this.parameters.name;
  }

  initialize(
    config: InventoryObjectConfig,
    parameters: InventoryObjectParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_equip(config.equip, parameters.equip);
    this.initialize_skill(config.skill, parameters.skill);
  }

  initialize_equip(
    id: string | number,
    parameters: EquipParameters
  ) {
    if (id === undefined) return;
    this.equip = EquipsUtils.create(parameters, id);
  }

  initialize_skill(
    id: string | number,
    parameters: SkillParameters
  ) {
    if (id === undefined) return;
    parameters.id = id;
    this.skill = SkillsUtils.create(parameters)
  }
}

export {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
}
