import type {
  InventoryObject
} from './inventory_object';

import * as utils from '../utils';

class InventoryController {
  list: InventoryObject[];

  constructor(
    public slots: number
  ) {}

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
}

 export {
   InventoryController
 }
