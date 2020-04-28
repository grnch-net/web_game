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
  InventoryController
} from '../inventory/index';

interface Stats {
  armor: number;
}

const slotCells = {
  [EquipSlot.Hold]: 2,
  [EquipSlot.Head]: 1,
  [EquipSlot.Body]: 1,
  [EquipSlot.Bag]: 1,
}

type EquipList = { [key in EquipSlot]?: InventoryObject[] };

class EquipsController {
  static defaultInventorySlots = 6;
  list: EquipList;
  inventory: InventoryController;
  armorProtect: number;
  stats: Stats;

  initialize(
    innerImpact: Impact,
    list: InventoryObjectParameters[],
    armorProtect: number
  ) {
    this.armorProtect = armorProtect;
    this.stats = {
      armor: 0
    };
    this.list = {};
    for (const key in slotCells) {
      let slot: EquipSlot = key as any;
      this.list[slot] = [];
    }
    this.initialize_inventory(innerImpact, list);
  }

  protected initialize_inventory(
    innerImpact: Impact,
    list: InventoryObjectParameters[]
  ) {
    const slots = EquipsController.defaultInventorySlots;
    this.inventory = new InventoryController(slots);
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
    if (equip.slot == EquipSlot.Hold) {
      this.add_hold_item(innerImpact, item, cell);
    } else {
      if (isNumber(cell) && cell < slotCells[equip.slot]) {
        this.removeSlot(innerImpact, equip.slot, cell, true);
        this.list[EquipSlot.Hold][cell] = item;
      } else {
        const free_cell = this.get_free_cell(equip.slot);
        if (free_cell == -1) {
          this.removeSlot(innerImpact, equip.slot, 0, true);
          this.list[equip.slot][0] = item;
        } else {
          this.removeSlot(innerImpact, equip.slot, free_cell, true);
          this.list[equip.slot][free_cell] = item;
        }
      }
    }
    equip.added(innerImpact);
    this.update_stats(equip);
    return true;
  }

  protected add_hold_item(
    innerImpact: Impact,
    item: InventoryObject,
    cell?: number
  ) {
    const equip = item.equip;
    const mainHandItem = this.list[EquipSlot.Hold][0];
    const offHandItem = this.list[EquipSlot.Hold][1];
    const mainHand = mainHandItem && mainHandItem.equip;
    let isTwoHand = mainHand && mainHand.type == EquipType.TwoHand;
    if (isTwoHand || equip.type == EquipType.TwoHand) {
      this.removeSlot(innerImpact, EquipSlot.Hold, 0, true);
      this.removeSlot(innerImpact, EquipSlot.Hold, 1, true);
      this.list[EquipSlot.Hold][0] = item;
    } else {
      if (isNumber(cell) && cell < slotCells[equip.slot]) {
        this.removeSlot(innerImpact, equip.slot, cell, true);
        this.list[EquipSlot.Hold][cell] = item;
      } else
      if (offHandItem) {
        this.removeSlot(innerImpact, EquipSlot.Hold, 0, true);
        this.list[EquipSlot.Hold][0] = item;
      } else {
        this.list[EquipSlot.Hold][1] = item;
      }
    }
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
    if (cell == -1) return false;
    return this.remove_equipped_item(innerImpact, item.equip, cell);
  }

  removeSlot(
    innerImpact: Impact,
    slot: EquipSlot,
    cell: number = 0,
    toInventory = false
  ): InventoryObject {
    const item = this.list[slot][cell];
    if (!item) return null;
    const checked = this.remove_equipped_item(innerImpact, item.equip, cell);
    if (checked) {
      toInventory && this.inventory.add(item);
      return item;
    }
    return null;
  }

  protected remove_equipped_item(
    innerImpact: Impact,
    equip: Equip,
    cell: number
  ): boolean {
    this.update_stats(equip, true);
    equip.removed(innerImpact);
    this.list[equip.slot][cell] = null;
    return true;
  }

  protected update_stats(
    equip: Equip,
    isRemove = false
  ) {
    const operation = isRemove ? -1 : 1;
    if (equip.stats.armor) {
      this.stats.armor += equip.stats.armor * operation;
    }
    if (equip.slot == EquipSlot.Bag) {
      this.inventory.slots += equip.stats.slots * operation;
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
