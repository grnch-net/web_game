import type {
  InventoryObjectParameters,
  InventoryObject
} from './inventory_object';

import {
  InventoryUtils
} from './inventory_utils';

import * as utils from '../utils';

class InventoryController {
  public slots: number;
  public list: InventoryObject[];

  get freeCells(): number {
    return this.slots - this.list.length;
  }

  initialize(
    slots: number,
    list: InventoryObjectParameters[]
  ) {
    this.slots = slots;
    this.list = [];
    this.initialize_list(list);
  }

  protected initialize_list(
    list: InventoryObjectParameters[]
  ) {
    for (const parameters of list) {
      const item = InventoryUtils.create(parameters);
      this.add(item);
    }
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

  getItem(
    index: number
  ): InventoryObject {
    return this.list[index];
  }

  getAll(): InventoryObject[] {
    return [...this.list];
  }

  // updateSlots(
  //   slots: number
  // ): boolean {
  //   if (this.list.length < slots) return false;
  //   this.slots = slots;
  //   return true;
  // }
}

 export {
   InventoryController
 }
