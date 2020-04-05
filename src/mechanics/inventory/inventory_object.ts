import type {
  SkillConfig,
  SkillParameters
} from '../skills/index';

import type {
  EquipConfig,
  EquipParameters
} from '../equips/index';

import {
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

interface UsageConfig extends SkillConfig {
  count?: number;
}

interface UsageParameters extends SkillParameters {
  count?: number;
}

interface InventoryObjectConfig extends InteractionConfig {
  usage?: UsageConfig;
  equip?: EquipConfig;
}

interface InventoryObjectParameters extends InteractionParameters {
  name?: string;
  usage?: UsageParameters;
  equip?: EquipParameters;
}

class InventoryObject extends InteractionObject {
  protected config: InventoryObjectConfig;
  protected parameters: InventoryObjectParameters;

  get name(): string {
    return this.config.name;
  }

  get customName(): string {
    return this.parameters.name;
  }
}

export {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
}
