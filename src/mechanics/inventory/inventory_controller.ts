import type {
  InventoryObjectParameters,
  InventoryObject
} from './inventory_object';

import {
  InventoryUtils
} from './inventory_utils';

import * as utils from '../utils';

class InventoryController {
  public slots: number
  public list: InventoryObject[];

  initialize(
    slots: number
  ) {
    this.slots = slots;
    this.list = [];
  }

  protected initialize_list(
    list: InventoryObjectParameters[]
  ) {
    for (const parameters of list) {
      const item = InventoryUtils.create(parameters);
      this.add(item);
    }
  }

  initializeList(
    list: InventoryObjectParameters[]
  ) {
    this.initialize_list(list);
  }

  add(
    items: InventoryObject | InventoryObject[]
  ): boolean {
    items = utils.toArray(items) as InventoryObject[];
    const length = this.list.length + items.length;
    if (length >= this.slots) return false;
    this.list.push(...items);
    return true;
  }

  remove(
    item: InventoryObject
  ): boolean {
    if (!this.list.includes(item)) return false;
    const index = this.list.indexOf(item);
    this.list.splice(index, 1);
    return true;
  }

  getUsableItem(
    index: number
  ): InventoryObject {
    const item = this.list[index];
    if (!item || !item.skill) return null;
    return item;
  }
}

 export {
   InventoryController
 }
