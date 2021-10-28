import {
  ItemParameters,
  Item
} from '../item/index';

interface InventoryConfig {
  slots?: number;
}

class Inventory {
  config: InventoryConfig;
  list: Item[];
  size: number;
  freeSlots: number;

  get slots(): number {
    return this.config.slots;
  }

  initialize(
    config: InventoryConfig,
    parameters?: ItemParameters[]
  ) {
    this.config = config;
    this.list = [];
    this.size = 0;
    this.freeSlots = this.slots;
    this.initialize_list(parameters);
  }

  protected initialize_list(
    parameters: ItemParameters[]
  ) {
    for (const data of parameters) {
      const item = Item.create(data);
      this.add(item);
    }
  }

  add(
    item: Item
  ): boolean {
    if (this.freeSlots < item.size) {
      return false;
    }
    this.list.push(item);
    this.size += item.size;
    this.freeSlots -= item.size;
    return true;
  }

  remove(
    item: Item
  ): boolean {
    const index = this.list.indexOf(item);
    if (index == -1) return false;
    this.list.splice(index, 1);
    this.size -= item.size;
    this.freeSlots += item.size;
    return true;
  }

  removeIndex(
    index: number
  ): Item {
    const item = this.list[index];
    if (!item) return;
    this.list.splice(index, 1);
    this.size -= item.size;
    this.freeSlots += item.size;
    return item;
  }

  getItem(
    index: number
  ): Item {
    return this.list[index];
  }

  getAll(): Item[] {
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
   Inventory,
   InventoryConfig
 }
