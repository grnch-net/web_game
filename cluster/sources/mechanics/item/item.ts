import * as UTILS from '../../utils/index';

import {
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

import {
  Inventory,
  InventoryConfig
} from '../inventory/index';

import {
  SkillConfig,
  SkillParameters,
  Skill
} from '../skills/index';

import {
  EquipConfig,
  EquipParameters,
  Equip,
} from '../equips/index';

import {
  inventoryConfig
} from '../configs/item_config';

interface ItemConfig extends InteractionConfig {
  specialClass?: string;
  size?: number;
  inventory?: InventoryConfig;
  skill?: string | number | SkillConfig;
  equip?: string | number | EquipConfig;
}

interface ItemParameters extends InteractionParameters {
  id: string | number;
  name?: string;
  skill?: SkillParameters;
  equip?: EquipParameters;
  inventory?: ItemParameters[];
}

interface InventoryCustomize {
  customs: Associative<typeof Item>;
  configs: Associative<Item>;

  AddCustomClass(
    id: string,
    custom: typeof Item
  ): void;

  findConfig(
    id: string
  ): ItemConfig;

  findSpecialClass(
    specialId: string
  ): typeof Item;

  create(
    parameters: ItemParameters,
    id?: string | number
  ): Item;
}

type Customize = typeof InteractionObject & InventoryCustomize;

@UTILS.customize(inventoryConfig)
@UTILS.modifiable
class Item extends (InteractionObject as Customize) {

  // TODO:
  // _parent: any;
  equip?: Equip;
  skill?: Skill;
  inventory?: Inventory;
  protected config: ItemConfig;
  protected parameters: ItemParameters;

  get customName(): string {
    return this.parameters.name;
  }

  get size(): number {
    let size = this.config.size || 1;
    if (this.inventory) {
      size += this.inventory.size;
    }
    return size;
  }

  initialize(
    config: ItemConfig,
    parameters: ItemParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_inventory(config, parameters);
  }

  initialize_inventory(
    config: ItemConfig,
    parameters: ItemParameters
  ) {
    if (!config.inventory) return;
    if (!parameters.inventory) parameters.inventory = [];
    this.inventory = new Inventory;
    this.inventory.initialize(config.inventory, parameters.inventory);
  }

}

export {
  ItemConfig,
  ItemParameters,
  Item
}
