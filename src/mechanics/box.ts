import {
  WorldObjectParameters,
  WorldObject
} from './world_object';

import {
  InventoryObjectParameters,
  InventoryController
} from './inventory/index';

interface BoxParameters extends WorldObjectParameters {
  inventory: InventoryObjectParameters[];
  slots?: number;
}

@UTILS.modifiable
class Box extends WorldObject {
  inventory: InventoryController;

  initialize(
    parameters: BoxParameters,
    slots: number = Infinity
  ) {
    super.initialize(parameters);
    this.initialize_inventory(slots, parameters);
  }

  initialize_inventory(
    slots: number,
    parameters: BoxParameters
  ) {
    this.inventory = new InventoryController;
    this.inventory.initialize(slots, parameters.inventory);
  }
}

export {
  BoxParameters,
  Box
};
