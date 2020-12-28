import type {
  Impact,
  InteractResult
} from '../interactions/index';

import {
  EquipSlot,
  EquipType,
  Equip
} from './equip';

import {
  InventoryObjectParameters,
  InventoryObject
} from '../inventories/index';

interface Stats {
  armor: number;
  slots: number;
  freeCells: number;
}

const slotCells = {
  [EquipSlot.Hold]: 2,
  [EquipSlot.Head]: 1,
  [EquipSlot.Body]: 1,
  [EquipSlot.Bag]: 1,
}

type EquipList = { [key in EquipSlot]?: InventoryObject[] };

class EquipsController {

  list: EquipList;
  armorProtect: number;
  stats: Stats;
  protected inventory_equips: InventoryObject[] = [];

  initialize(
    innerImpact: Impact,
    list: InventoryObjectParameters[],
    armorProtect: number
  ) {
    this.initialize_vars(armorProtect);
    this.initialize_list(innerImpact, list);
  }

  protected initialize_vars(
    armorProtect: number
  ) {
    this.armorProtect = armorProtect;
    this.stats = {
      armor: 0,
      slots: 0,
      freeCells: 0
    };
  }

  protected initialize_list(
    innerImpact: Impact,
    list: InventoryObjectParameters[]
  ) {
    this.list = {};
    for (const key in slotCells) {
      let slot: EquipSlot = key as any;
      this.list[slot] = [];
    }
    for (const parameters of list) {
      const item = InventoryObject.create(parameters);
      this.add([], innerImpact, item);
    }
  }

  add(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    item: InventoryObject,
    cell: number = -1
  ) {
    const equip = item.equip;
    if (!equip) {
      removedItems.push(item);
      return;
    }
    if (equip.slot == EquipSlot.Hold) {
      this.replace_hold_item(removedItems, innerImpact, item, cell);
    } else {
      this.replace_equip(removedItems, innerImpact, item, cell);
    }
    equip.added(innerImpact);
    this.update_stats(item);
  }

  protected replace_equip(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    item: InventoryObject,
    cell: number
  ) {
    const equip = item.equip;
    const slot = equip.slot;
    if (cell > -1 && cell < slotCells[slot]) {
      this.remove_equipped_item(removedItems, innerImpact, slot, cell);
      this.list[slot][cell] = item;
      return;
    }
    const free_cell = this.get_free_cell(slot);
    if (free_cell > -1) {
      this.list[slot][free_cell] = item;
      return;
    }
    this.replace_equip(removedItems, innerImpact, item, 0);
  }

  protected replace_hold_item(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    item: InventoryObject,
    cell: number
  ) {
    const slot = item.equip.slot;
    const mainHandItem = this.list[slot][0];
    if (this.isTwoHand(mainHandItem) || this.isTwoHand(item)) {
      this.remove_equipped_item(removedItems, innerImpact, slot, 0);
      this.remove_equipped_item(removedItems, innerImpact, slot, 1);
      this.list[slot][0] = item;
      return;
    }
    this.replace_equip(removedItems, innerImpact, item, cell);
  }

  isTwoHand(
    item: InventoryObject
  ): boolean {
    return item && item.equip && item.equip.type === EquipType.TwoHand;
  }

  protected get_free_cell(
    slot: EquipSlot
  ): number {
    for (let i = 0; i < slotCells[slot]; i++) {
      if (!this.list[slot][i]) return i;
    }
    return -1;
  }

  removeToInventory(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    item: InventoryObject
  ) {
    this.remove(removedItems, innerImpact, item);
    while (removedItems.length && this.stats.freeCells > 0) {
      const removed_item = removedItems.pop();
      this.add_to_inventory(removed_item);
    }
  }

  remove(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    item: InventoryObject
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
    removedItems: InventoryObject[],
    innerImpact: Impact,
    slot: EquipSlot,
    cell: number
  ) {
    const item = this.list[slot][cell];
    if (!item) return;
    this.list[slot][cell] = null;
    this.update_stats(item, true);
    item.equip.removed(innerImpact);
    removedItems.push(item);
  }

  protected update_stats(
    item: InventoryObject,
    isRemove = false
  ) {
    const operation = isRemove ? -1 : 1;
    if (item.equip.stats?.armor) {
      this.stats.armor += item.equip.stats.armor * operation;
    }
    if (item.inventory) {
      this.stats.freeCells += item.inventory.freeCells * operation;
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
    item: InventoryObject
  ): number {
    const equip = item.equip;
    if (!equip) return -1;
    for (let i = 0; i < slotCells[equip.slot]; i++) {
      if (this.list[equip.slot][i] == item) return i;
    }
    return -1;
  }

  hasItem(
    item: InventoryObject
  ): boolean {
    return this.get_item_cell(item) != -1;
  }

  getAll(): InventoryObject[] {
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
    item: InventoryObject
  ): boolean {
    if (this.stats.freeCells <= 0) return false;
    this.add_to_inventory(item);
    return true;
  }

  add_to_inventory(
    item: InventoryObject
  ) {
    for (const equip_item of this.inventory_equips) {
      if (equip_item.inventory.freeCells <= 0) continue;
      equip_item.inventory.add(item);
      break;
    }
    this.stats.freeCells--;
  }

  addToInventoryIndex(
    item: InventoryObject,
    inventoryIndex: number
  ): boolean {
    const equip_item = this.inventory_equips[inventoryIndex];
    if (!equip_item) return false;
    const added = equip_item.inventory.add(item);
    if (added) {
      this.stats.freeCells--;
      return true;
    }
    return false;
  }

  equipInventoryItem(
    removedItems: InventoryObject[],
    innerImpact: Impact,
    inventoryIndex: number,
    itemIndex: number,
    cell?: number
  ) {
    const item = this.removeInventoryItem(inventoryIndex, itemIndex);
    this.add(removedItems, innerImpact, item, cell);
    while (removedItems.length && this.stats.freeCells > 0) {
      const removed_item = removedItems.pop();
      this.add_to_inventory(removed_item);
    }
  }

  removeInventoryItem(
    inventoryIndex: number,
    itemIndex: number
  ): InventoryObject {
    const equip = this.inventory_equips[inventoryIndex];
    if (!equip) return null;
    const item = equip.inventory.removeIndex(itemIndex);
    if (!item) return null;
    this.stats.freeCells++;
    return item;
  }

  getInventoryItem(
    inventoryIndex: number,
    itemIndex: number
  ): InventoryObject {
    const equip = this.inventory_equips[inventoryIndex];
    if (!equip) return null;
    return equip.inventory.getItem(itemIndex);
  }

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ) {
    let damage = -innerImpact.influenced.health;
    if (!damage || damage < 0) return;
    if (damage > this.stats.armor) {
      damage -= this.stats.armor * this.armorProtect;
    } else {
      damage *= 1 - this.armorProtect;
    }
    innerImpact.influenced.health = -damage;
  }

}

export {
  EquipsController
}
