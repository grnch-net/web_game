import type {
  Impact,
  TargetInteractResult
} from '../interactions/index';

import {
  Equip
} from './equip';

import {
  ItemParameters,
  Item
} from '../item/index';

interface Stats {
  armor: number;
  slots: number;
  freeSlots: number;
}

type EquipSlot = number | string;
type EquipList = { [key: string]: Item[] };
type Slots = { [key: string]: number };

class EquipsController {

  slots: Slots;
  list: EquipList;
  stats: Stats;
  protected inventory_equips: Item[] = [];

  initialize(
    innerImpact: Impact,
    list: ItemParameters[],
    slots: Slots
  ) {
    this.initialize_vars(slots);
    this.initialize_list(innerImpact, list);
  }

  protected initialize_vars(
    slots: Slots
  ) {
    this.stats = {
      armor: 0,
      slots: 0,
      freeSlots: 0
    };
    this.slots = slots;
    this.list = {};
  }

  protected initialize_list(
    innerImpact: Impact,
    list: ItemParameters[],
  ) {
    for (const slot in this.slots) {
      this.list[slot] = [];
    }
    if (list) {
      for (const parameters of list) {
        const item = Item.create(parameters);
        this.add([], innerImpact, item);
      }
    }
  }

  add(
    removedItems: Item[],
    innerImpact: Impact,
    item: Item
  ) {
    const equip = item.equip;
    if (!equip) {
      removedItems.push(item);
      return;
    }
    this.replace_equip(removedItems, innerImpact, item);
  }

  protected replace_equip(
    removedItems: Item[],
    innerImpact: Impact,
    item: Item,
    // cell: number
  ) {
    const slot = item.equip.slot;
    if (item.equip.size > this.slots[slot]) {
      removedItems.push(item);
      return;
    }
  
    if (item.equip.size === this.slots[slot]) {
      for (const item of this.list[slot]) {
        this.remove_equipped_item(removedItems, innerImpact, slot);
      }
    } else {
      let free_cells = this.get_free_slot_cells_count(slot);
      while (free_cells < item.equip.size) {
        this.remove_equipped_item(removedItems, innerImpact, slot);
      }
    }
    
    this.list[slot].push(item);
    item.equip.added(innerImpact);
    this.update_stats(item);
  }

  protected get_free_slot_cells_count(
    slot: EquipSlot
  ): number {
    const list = this.list[slot];
    const slot_cells_clount = this.slots[slot];
    let free_cells_count = slot_cells_clount;
    for (const item of list) {
      free_cells_count -= item.equip.size
    }
    return free_cells_count;
  }

  removeToInventory(
    removedItems: Item[],
    innerImpact: Impact,
    item: Item
  ) {
    this.remove(removedItems, innerImpact, item);
    while (removedItems.length && this.stats.freeSlots > 0) {
      const removed_item = removedItems.pop();
      this.add_to_inventory(removed_item);
    }
  }

  remove(
    removedItems: Item[],
    innerImpact: Impact,
    item: Item
  ): boolean {
    let cell = this.get_item_cell(item);
    if (cell == -1) {
      console.error('The item is not equipped.');
      return false;
    }
    const slot = item.equip.slot;
    this.remove_equipped_item(removedItems, innerImpact, slot, cell);
    return true;
  }

  protected remove_equipped_item(
    removedItems: Item[],
    innerImpact: Impact,
    slot: EquipSlot,
    cell: number = null
  ) {
    const list = this.list[slot];
    if (list.length === 0) {
      return;
    }
    let item: Item;
    if (cell === null) {
      item = this.list[slot].pop();
    } else {
      if (this.list[slot][cell]) {
        return;
      }
      item = this.list[slot].splice(cell, 1)[0];
    }
    this.update_stats(item, true);
    item.equip.removed(innerImpact);
    removedItems.push(item);
  }

  protected update_stats(
    item: Item,
    isRemove = false
  ) {
    const operation = isRemove ? -1 : 1;
    if (item.equip.stats?.armor) {
      this.stats.armor += item.equip.stats.armor * operation;
    }
    if (item.inventory) {
      this.stats.freeSlots += item.inventory.freeSlots * operation;
      if (isRemove) {
        const index = this.inventory_equips.indexOf(item);
        this.inventory_equips.splice(index, 1);
      } else {
        this.inventory_equips.push(item);
      }
    }
  }

  getEquips(
    slots: EquipSlot[]
  ): Equip[] {
    if (!slots) {
      return null;
    }
    const equips = [];
    for (const slot of slots) {
      if (!this.list[slot]) continue;
      for (const item of this.list[slot]) {
        equips.push(item.equip);
      }
    }
    return equips;
  }

  protected get_item_cell(
    item: Item
  ): number {
    const equip = item.equip;
    if (!equip) return -1;
    for (let i = 0; i < this.slots[equip.slot]; i++) {
      if (this.list[equip.slot][i] == item) return i;
    }
    return -1;
  }

  hasItem(
    item: Item
  ): boolean {
    return this.get_item_cell(item) != -1;
  }

  getAll(): Item[] {
    const list = [];
    const slots = Object.values(this.list);
    for (const slot of slots) {
      for (const item of slot) {
        list.push(item);
      }
    }
    return list;
  }

  addToInventory(
    item: Item
  ): boolean {
    if (this.stats.freeSlots <= 0) return false;
    this.add_to_inventory(item);
    return true;
  }

  add_to_inventory(
    item: Item
  ) {
    for (const equip_item of this.inventory_equips) {
      if (equip_item.inventory.freeSlots <= 0) continue;
      equip_item.inventory.add(item);
      break;
    }
    this.stats.freeSlots--;
  }

  addToInventoryIndex(
    item: Item,
    inventoryIndex: number
  ): boolean {
    const equip_item = this.inventory_equips[inventoryIndex];
    if (!equip_item) return false;
    const added = equip_item.inventory.add(item);
    if (added) {
      this.stats.freeSlots--;
      return true;
    }
    return false;
  }

  equipInventoryItem(
    removedItems: Item[],
    innerImpact: Impact,
    inventoryIndex: number,
    itemIndex: number,
  ) {
    const item = this.removeInventoryItem(inventoryIndex, itemIndex);
    this.add(removedItems, innerImpact, item);
    while (removedItems.length && this.stats.freeSlots > 0) {
      const removed_item = removedItems.pop();
      this.add_to_inventory(removed_item);
    }
  }

  removeInventoryItem(
    inventoryIndex: number,
    itemIndex: number
  ): Item {
    const equip = this.inventory_equips[inventoryIndex];
    if (!equip) return null;
    const item = equip.inventory.removeIndex(itemIndex);
    if (!item) return null;
    this.stats.freeSlots++;
    return item;
  }

  getInventoryItem(
    inventoryIndex: number,
    itemIndex: number
  ): Item {
    const equip = this.inventory_equips[inventoryIndex];
    if (!equip) return null;
    return equip.inventory.getItem(itemIndex);
  }

  onOuterImpact(
    innerImpact: Impact,
    result: TargetInteractResult
  ) {
    let damage = -innerImpact.influenced.health;
    if (!damage || damage < 0) return;
    damage -= this.stats.armor;
    damage = Math.max(damage, 0);
    innerImpact.influenced.health = -damage;
  }

}

export {
  EquipsController
}
