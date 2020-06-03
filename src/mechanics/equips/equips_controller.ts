import type {
  Impact,
  InteractResult
} from '../interactions/index';

import {
  isNumber
} from '../utils';

import {
  EquipSlot,
  EquipType,
  Equip
} from './equip';

import {
  InventoryObjectParameters,
  InventoryObject,
  InventoryUtils,
  // InventoryController
} from '../inventory/index';

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
  protected inventory_equips: InventoryObject[];

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
      const item = InventoryUtils.create(parameters);
      this.add(innerImpact, item);
    }
  }

  add(
    innerImpact: Impact,
    item: InventoryObject,
    cell?: number
  ): boolean {
    const equip = item.equip;
    if (!equip) return false;
    let checked: boolean;
    if (equip.slot == EquipSlot.Hold) {
      checked = this.replace_hold_item(innerImpact, item, cell);
      if (!checked) return false;
    } else
    if (equip.slot == EquipSlot.Bag) {
      checked = this.replace_bag_item(innerImpact, item, cell);
      if (!checked) return false;
    } else {
      checked = this.replace_equip(innerImpact, item, cell);
      if (!checked) return false;
    }
    equip.added(innerImpact);
    this.update_stats(item);
    return true;
  }

  protected replace_equip(
    innerImpact: Impact,
    item: InventoryObject,
    cell?: number
  ): boolean {
    const equip = item.equip;
    let checked: boolean;
    if (isNumber(cell) && cell < slotCells[equip.slot]) {
      checked = this.removeSlotCell(innerImpact, equip.slot, cell);
      if (!checked) return false;
      this.list[EquipSlot.Hold][cell] = item;
    } else {
      const free_cell = this.get_free_cell(equip.slot);
      if (free_cell == -1) {
        checked = this.removeSlotCell(innerImpact, equip.slot, 0);
        if (!checked) return false;
        this.list[equip.slot][0] = item;
      } else {
        checked = this.removeSlotCell(innerImpact, equip.slot, free_cell);
        if (!checked) return false;
        this.list[equip.slot][free_cell] = item;
      }
    }
    return true;
  }

  protected replace_bag_item(
    innerImpact: Impact,
    item: InventoryObject,
    cell?: number
  ): boolean {
    // TODO:
    return true;
  }

  protected replace_hold_item(
    innerImpact: Impact,
    item: InventoryObject,
    cell?: number
  ): boolean {
    const equip = item.equip;
    const mainHandItem = this.list[EquipSlot.Hold][0];
    const offHandItem = this.list[EquipSlot.Hold][1];
    const mainHand = mainHandItem && mainHandItem.equip;
    let isTwoHand = mainHand && mainHand.type == EquipType.TwoHand;
    let checked: boolean;
    if (isTwoHand || equip.type == EquipType.TwoHand) {
      checked = this.removeAllSlotCells(innerImpact, EquipSlot.Hold);
      if (!checked) return false;
      this.list[EquipSlot.Hold][0] = item;
    } else {
      if (isNumber(cell) && cell < slotCells[equip.slot]) {
        checked = this.removeSlotCell(innerImpact, equip.slot, cell);
        if (!checked) return false;
        this.list[EquipSlot.Hold][cell] = item;
      } else
      if (offHandItem) {
        checked = this.removeSlotCell(innerImpact, EquipSlot.Hold, 0);
        if (!checked) return false;
        this.list[EquipSlot.Hold][0] = item;
      } else {
        this.list[EquipSlot.Hold][1] = item;
      }
    }
    return true;
  }

  protected get_free_cell(
    slot: EquipSlot
  ): number {
    for (let i = 0; i < slotCells[slot]; i++) {
      if (!this.list[slot][i]) return i;
    }
    return -1;
  }

  remove(
    innerImpact: Impact,
    item: InventoryObject
  ): boolean {
    let cell = this.get_item_cell(item);
    if (cell == -1) {
      console.error('The item is not equipped.');
      return false;
    }
    if (this.check_inventory_free_cell) return false;
    this.remove_equipped_item(innerImpact, item, cell);
    return true;
  }

  removeSlotCell(
    innerImpact: Impact,
    slot: EquipSlot,
    cell: number = 0
  ): boolean {
    const item = this.list[slot][cell];
    if (!item) return false;
    if (this.check_inventory_free_cell) return false;
    this.remove_equipped_item(innerImpact, item, cell);
    return true;
  }

  protected check_inventory_free_cell() {
    if (this.stats.freeCells > 0) {
      return true;
    }
    console.info('Equip cannot be removed. The inventory is full.');
    return false;
  }

  removeAllSlotCells(
    innerImpact: Impact,
    slot: EquipSlot
  ): boolean {
    let count: number = 0;
    for (const item of this.list[slot]) {
      item && count++;
    }
    if (count == 0) return true;
    if (count > this.stats.freeCells) {
      return false;
    }
    let cell = -1;
    for (const item of this.list[slot]) {
      cell++;
      if (!item) continue;
      this.remove_equipped_item(innerImpact, item, cell);
    }
    return true;
  }

  protected remove_equipped_item(
    innerImpact: Impact,
    item: InventoryObject,
    cell: number
  ) {
    this.list[item.equip.slot][cell] = null;
    this.update_stats(item, true);
    item.equip.removed(innerImpact);
    this.add_to_inventory(item);
  }

  protected update_stats(
    item: InventoryObject,
    isRemove = false
  ) {
    const operation = isRemove ? -1 : 1;
    if (item.equip.stats.armor) {
      this.stats.armor += item.equip.stats.armor * operation;
    }
    if (item.slots) {
      this.stats.slots += item.slots * operation;
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
    if (this.check_inventory_free_cell) return false;
    this.add_to_inventory(item);
    return true;
  }

  add_to_inventory(
    item: InventoryObject
  ) {
    for (const equip_item of this.inventory_equips) {
      if (!equip_item.inventory.freeCells) continue;
      equip_item.inventory.add(item);
      break;
    }
    this.stats.freeCells--;
  }

  equipInventoryItem(
    innerImpact: Impact,
    inventoryIndex: number,
    itemIndex: number,
    cell?: number
  ): boolean {
    const equip = this.inventory_equips[inventoryIndex];
    if (!equip) return false;
    const item = equip.inventory.getItem(itemIndex);
    if (!item) return false;
    equip.inventory.remove(item);
    this.stats.freeCells++;
    const added = this.add(innerImpact, item, cell);
    if (!added) {
      equip.inventory.add(item);
      this.stats.freeCells--;
      return false;
    }
    return true;
  }

  getInventoryItem(
    inventoryIndex: number,
    itemIndex: number,
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
