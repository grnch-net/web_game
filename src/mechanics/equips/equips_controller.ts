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
  list: { [key in EquipSlot]?: Equip };
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
      const equip = InventoryUtils.create(parameters) as Equip;
      this.add(equip, innerImpact);
    }
  }

  add(
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    const slots: EquipSlot[] = toArray(equip.slot);
    for (const slot of slots) {
      if (!this.list[slot]) {
        return this.replace_slot(slot, equip, innerImpact);
      }
    }
    return this.replace_slot(slots[0], equip, innerImpact);
  }

  protected replace_slot(
    slot: EquipSlot,
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    if (weaponTypes.includes(equip.type)) {
      const mainHand = this.list[EquipSlot.MainHand];
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
    this.list[slot] = equip;
    equip.added(innerImpact);
    this.update_stats(equip, slot);
    return true;
  }

  remove(
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    let slot = this.getEquippedSlot(equip);
    if (!slot) return false;
    return this.remove_equipped_item(equip, slot, innerImpact);
  }

  removeSlot(
    slot: EquipSlot,
    innerImpact: Impact,
    toInventory = false
  ): Equip {
    const equip: Equip = this.list[slot];
    if (!equip) return null;
    const checked = this.remove_equipped_item(equip, slot, innerImpact);
    if (checked) {
      toInventory && this.inventory.add(equip);
      return equip;
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


  getSlots(
    slots: EquipSlot[]
  ): Equip[] {
    if (!slots) return null;
    const result = [];
    for (const slot of slots) {
      result.push(this.list[slot]);
    }
    return result;
  }

  getEquippedSlot(
    equip: Equip
  ): EquipSlot {
    const slots: EquipSlot[] = toArray(equip.slot);
    for (const slot of slots) {
      const checked = this.list[slot] == equip;
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
