import {
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

import {
  InventoryController
} from './inventory_controller';

import {
  SkillParameters,
  Skill
} from '../skills/index';

import {
  EquipParameters,
  Equip
} from '../equips/index';

import {
  inventoryConfig
} from '../configs/inventory_config';

interface InventoryObjectConfig extends InteractionConfig {
  specialClass?: string;
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

interface InventoryCustomize {
  customs: Associative<typeof InventoryObject>;
  configs: Associative<InventoryObject>;

  AddCustomClass(
    id: string,
    custom: typeof InventoryObject
  ): void;

  findConfig(
    id: string
  ): InventoryObjectConfig;

  findSpecialClass(
    specialId: string
  ): typeof InventoryObject;

  create(
    parameters: InventoryObjectParameters,
    id?: string | number
  ): InventoryObject;
}

type Customize = typeof InteractionObject & InventoryCustomize;

@UTILS.customize(inventoryConfig)
class InventoryObject extends (InteractionObject as Customize) {

  // TODO:
  // _parent: any;
  equip?: Equip;
  skill?: Skill;
  inventory?: InventoryController;
  protected config: InventoryObjectConfig;
  protected parameters: InventoryObjectParameters;

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
    this.equip = Equip.create(parameters.equip, id);
  }

  initialize_skill(
    id: string | number,
    parameters: InventoryObjectParameters
  ) {
    if (id === undefined) return;
    if (!parameters.skill) parameters.skill = { id };
    this.skill = Skill.create(parameters.skill, id);
  }

  initialize_inventory(
    slots: number,
    parameters: InventoryObjectParameters
  ) {
    if (slots === undefined) return;
    if (!parameters.inventory) parameters.inventory = [];
    this.inventory = new InventoryController;
    this.inventory.initialize(slots, parameters.inventory);
  }

}

export {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
}
