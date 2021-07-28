import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from '../../inventory_object';

import {
  EquipConfig,
  Equip
} from '../../../equips/index';

type Mod = Modifiable<typeof InventoryObject>;

class InventoryObjectEquip extends (InventoryObject as Mod).Latest {

  initialize(
    config: InventoryObjectConfig,
    parameters: InventoryObjectParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_equip(config.equip, parameters);
  }

  initialize_equip(
    config: string | number | EquipConfig,
    parameters: InventoryObjectParameters
  ) {
    if (config === undefined) return;
    if (!parameters.equip) parameters.equip = {};
    this.equip = Equip.create(parameters.equip, config);
  }

}

(InventoryObject as Mod).modify(InventoryObjectEquip);
