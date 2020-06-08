import {
  InventoryController
} from './inventory_controller';

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
  slots?: number;
  skill?: string | number;
  equip?: string | number;
}

interface InventoryObjectParameters extends InteractionParameters {
  id: string | number;
  name?: string;
  skill?: SkillParameters;
  equip?: EquipParameters;
  inventory?: InventoryObjectParameters[];
}

class InventoryObject extends InteractionObject {
  // TODO:
  // _parent: any;
  equip?: Equip;
  skill?: Skill;
  inventory?: InventoryController;
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
    this.initialize_equip(config.equip, parameters);
    this.initialize_skill(config.skill, parameters);
    this.initialize_inventory(config.slots, parameters);
  }

  initialize_equip(
    id: string | number,
    parameters: InventoryObjectParameters
  ) {
    if (id === undefined) return;
    if (!parameters.equip) parameters.equip = {};
    this.equip = EquipsUtils.create(parameters.equip, id);
  }

  initialize_skill(
    id: string | number,
    parameters: InventoryObjectParameters
  ) {
    if (id === undefined) return;
    if (!parameters.skill) parameters.skill = { id };
    this.skill = SkillsUtils.create(parameters.skill, id);
  }

  initialize_inventory(
    slots: number,
    parameters: InventoryObjectParameters
  ) {
    if (slots === undefined) return;
    this.inventory = new InventoryController;
    this.inventory.initialize(slots, parameters.inventory);
  }
}

export {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
}
