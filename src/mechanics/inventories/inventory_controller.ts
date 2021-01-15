import {
  InventoryObjectParameters,
  InventoryObject
} from './inventory_object';

class InventoryController {
  slots: number;
  list: InventoryObject[];

  get freeCells(): number {
    return this.slots - this.list.length;
  }

  initialize(
    slots: number,
    parameters?: InventoryObjectParameters[]
  ) {
    this.slots = slots;
    this.list = [];
    this.initialize_list(parameters);
  }

  protected initialize_list(
    parameters: InventoryObjectParameters[]
  ) {
    for (const data of parameters) {
      const item = InventoryObject.create(data);
      this.add(item);
    }
  }

  add(
    items: InventoryObject | InventoryObject[]
  ): boolean {
    items = UTILS.array.toArray(items) as InventoryObject[];
    const length = this.list.length + items.length;
    if (length > this.slots) return false;
    this.list.push(...items);
    return true;
  }

  remove(
    item: InventoryObject
  ): boolean {
    const index = this.list.indexOf(item);
    if (index == -1) return false;
    this.list.splice(index, 1);
    return true;
  }

  removeIndex(
    index: number
  ): InventoryObject {
    const item = this.list[index];
    if (!item) return;
    this.list.splice(index, 1);
    return item;
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
