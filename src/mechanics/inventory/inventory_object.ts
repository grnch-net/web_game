import type {
  SkillParameters,
  Skill
} from '../skills/index';

import type {
  EquipParameters,
  Equip
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
    this.initialize_equip();
    this.initialize_skill();
  }

  initialize_equip() {

  }

  initialize_skill() {

  }
}

export {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
}
