import { Equip, EquipParameters, EquipSlot, EquipType } from './equip';
import { equipUtils } from './equips_utils';
import { Impact } from '../interactions/index';
import { toArray } from '../utils';

const weaponTypes = [
  EquipType.OneHand, EquipType.SecondHand, EquipType.TwoHand
];

const armorTypes = [
  EquipType.LightArmor, EquipType.MediumArmor, EquipType.HeavyArmor
];

interface Stats {
  armor: number;
  slots: number;
}

export class EquipsController {
  list: { [key in EquipSlot]?: Equip };
  armorProtect: number;
  stats: Stats;

  initialize(
    list: EquipParameters[],
    innerImpact: Impact,
    armorProtect: number
  ) {
    this.list = {};
    this.armorProtect = armorProtect;
    this.stats = {
      armor: 0,
      slots: 0
    };
    for (const parameters of list) {
      const equip = equipUtils.create(parameters);
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
        this.removeSlot(EquipSlot.MainHand, innerImpact);
        this.removeSlot(EquipSlot.SecondHand, innerImpact);
      } else {
        this.removeSlot(slot, innerImpact);
      }
    } else {
      this.removeSlot(slot, innerImpact);
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
    innerImpact: Impact
  ): boolean {
    const equip: Equip = this.list[slot];
    if (!equip) return false;
    return this.remove_equipped_item(equip, slot, innerImpact);
  }

  protected remove_equipped_item(
    equip: Equip,
    slot: EquipSlot,
    innerImpact: Impact
  ) {
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
    const multiply = isRemove ? -1 : 1;
    if (armorTypes.includes(equip.type)) {
      this.stats.armor += equip.stats.armor * multiply;
    } else
    if (slot == EquipSlot.Bag) {
      this.stats.slots += equip.stats.slots * multiply;
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
