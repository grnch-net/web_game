import * as UTILS from '../utils/index';

import {
  WorldObjectParameters,
  WorldObject
} from './world_object';

import {
  Inventory
} from './inventory/index';

import {
  ItemParameters,
} from './item/index';

interface BoxParameters extends WorldObjectParameters {
  inventory: ItemParameters[];
  slots?: number;
}

@UTILS.modifiable
class Box extends WorldObject {
  inventory: Inventory;

  protected _initialize(
    parameters: BoxParameters,
    slots: number = Infinity
  ) {
    super._initialize(parameters);
    this.initialize_inventory(slots, parameters);
  }

  initialize_inventory(
    slots: number,
    parameters: BoxParameters
  ) {
    this.inventory = new Inventory;
    this.inventory.initialize({ slots }, parameters.inventory);
  }
}

export {
  BoxParameters,
  Box
};
