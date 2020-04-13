import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from './inventory_object';

import {
  inventoryConfig
} from '../configs/inventory_config';

import {
  InteractionUtils
} from '../interactions/index';

class InventoryUtils extends InteractionUtils {
  static BaseClass = InventoryObject;
  static configs = inventoryConfig;

  static findConfig(
    id: string
  ): InventoryObjectConfig {
    return super.findConfig(id) as InventoryObjectConfig;
  }

  static findSpecialClass(
    specialId: string
  ): typeof InventoryObject {
    return super.findSpecialClass(specialId) as typeof InventoryObject;
  }

  static create(
    parameters: InventoryObjectParameters,
    id?: string | number
  ): InventoryObject {
    if (!id && id !== 0) {
      id = parameters.id;
    }
    return super.create(parameters, id) as InventoryObject;
  }
}

export {
  InventoryUtils
}
