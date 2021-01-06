console.info('inventories/modifications/equip/inventory_object');

import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from '../../inventory_object';

import {
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
    id: string | number,
    parameters: InventoryObjectParameters
  ) {
    if (id === undefined) return;
    if (!parameters.equip) parameters.equip = {};
    this.equip = Equip.create(parameters.equip, id);
  }

}

(InventoryObject as Mod).modify(InventoryObjectEquip);
