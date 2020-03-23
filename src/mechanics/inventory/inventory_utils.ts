import { InteractionUtils } from '../interactions/index';
import {
  InventoryObject, InventoryObjectConfig, InventoryObjectParameters
} from './inventory_object';
import { inventoryConfig, InventoryConfig } from '../configs/inventory';
import { specialClassList } from './specials/index';

type ClassList = { [id: string]: typeof InventoryObject };

export class inventoryUtils extends InteractionUtils {
  static BaseClass: typeof InventoryObject = InventoryObject;
  static get configs(): InventoryConfig { return inventoryConfig; }
  static specialClassList: ClassList = specialClassList;

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
    config?: InventoryObjectConfig
  ): InventoryObject {
    return super.create(parameters, config) as InventoryObject;
  }
}
