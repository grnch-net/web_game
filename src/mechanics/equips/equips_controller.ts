import type {
  Impact
} from '../interactions/index';

import {
  toArray
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

const weaponTypes = [
  EquipType.OneHand,
  EquipType.SecondHand,
  EquipType.TwoHand
];

const armorTypes = [
  EquipType.LightArmor,
  EquipType.MediumArmor,
  EquipType.HeavyArmor
];

interface Stats {
  armor: number;
}

class EquipsController {
  static defaultSlots = 6;
  list: { [key in EquipSlot]?: InventoryObject };
  inventory: InventoryController;
  armorProtect: number;
  stats: Stats;

  initialize(
    list: InventoryObjectParameters[],
    innerImpact: Impact,
    armorProtect: number
  ) {
    this.list = {};
    this.armorProtect = armorProtect;
    this.stats = {
      armor: 0
    };
    const slots = EquipsController.defaultSlots;
    this.inventory = new InventoryController(slots);
    for (const parameters of list) {
      const equip = InventoryUtils.create(parameters);
      this.add(equip, innerImpact);
    }
  }

  add(
    item: InventoryObject,
    innerImpact: Impact
  ): boolean {
    const equip = item.equip;
    if (!equip) return false;
    const slots: EquipSlot[] = toArray(equip.slot);
    for (const slot of slots) {
      if (!this.list[slot]) {
        return this.replace_slot(slot, item, innerImpact);
      }
    }
    return this.replace_slot(slots[0], item, innerImpact);
  }

  protected replace_slot(
    slot: EquipSlot,
    item: InventoryObject,
    innerImpact: Impact
  ): boolean {
    const equip = item.equip;
    if (!equip) return;
    if (weaponTypes.includes(equip.type)) {
      const mainHandItem = this.list[EquipSlot.MainHand];
      const mainHand = mainHandItem && mainHandItem.equip;
      let isTwoHand = mainHand && mainHand.type == EquipType.TwoHand;
      if (isTwoHand || equip.type == EquipType.TwoHand) {
        this.removeSlot(EquipSlot.MainHand, innerImpact, true);
        this.removeSlot(EquipSlot.SecondHand, innerImpact, true);
      } else {
        this.removeSlot(slot, innerImpact, true);
      }
    } else {
      this.removeSlot(slot, innerImpact, true);
    }
    this.list[slot] = item;
    equip.added(innerImpact);
    this.update_stats(equip, slot);
    return true;
  }

  remove(
    item: InventoryObject,
    innerImpact: Impact
  ): boolean {
    let slot = this.getEquippedSlot(item);
    if (!slot) return false;
    return this.remove_equipped_item(item.equip, slot, innerImpact);
  }

  removeSlot(
    slot: EquipSlot,
    innerImpact: Impact,
    toInventory = false
  ): InventoryObject {
    const item = this.list[slot];
    if (!item) return null;
    const checked = this.remove_equipped_item(item.equip, slot, innerImpact);
    if (checked) {
      toInventory && this.inventory.add(item);
      return item;
    }
    return null;
  }

  protected remove_equipped_item(
    equip: Equip,
    slot: EquipSlot,
    innerImpact: Impact
  ): boolean {
    this.update_stats(equip, slot, true);
    equip.removed(innerImpact);
    this.list[slot] = null;
    return true;
  }

  protected update_stats(
    equip: Equip,
    slot: EquipSlot,
    isRemove = false
  ) {
    const operation = isRemove ? -1 : 1;
    if (armorTypes.includes(equip.type)) {
      this.stats.armor += equip.stats.armor * operation;
    } else
    if (slot == EquipSlot.Bag) {
      this.inventory.slots += equip.stats.slots * operation;
    }
  }


  getSlotsEquip(
    slots: EquipSlot[]
  ): Equip[] {
    if (!slots) return null;
    const equips = [];
    for (const slot of slots) {
      equips.push(this.list[slot].equip);
    }
    return equips;
  }

  getEquippedSlot(
    item: InventoryObject
  ): EquipSlot {
    const equip = item.equip;
    if (!equip) return null;
    const slots: EquipSlot[] = toArray(equip.slot);
    for (const slot of slots) {
      const checked = this.list[slot] == item;
      return checked ? slot : null;
    }
  }

  onOuterImpact(
    impact: Impact
  ): boolean {
    let damage = impact.negative.health;
    if (!damage || damage < 0) return false;
    if (damage > this.stats.armor) {
      damage -= this.stats.armor * this.armorProtect;
    } else {
      damage *= 1 - this.armorProtect;
    }
    impact.negative.health = damage;
    return true;
  }
}

export {
  EquipsController
}
