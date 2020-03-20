import {
  Equip, EquipParameters, EquipSlot, EquipType, WeaponType
} from './equip';
import { equipUtils } from './equips_utils';
import { Impact } from '../interactions/index';
import { toArray } from '../utils';
export class EquipsController {
  list: { [key in EquipSlot]?: Equip };

  initialize(
    list: EquipParameters[],
    innerImpact: Impact
  ) {
    this.list = {};
    for (const parameters of list) {
      const equip = equipUtils.create(parameters);
      this.add(equip, innerImpact);
    }
  }

  add(
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    if (!Array.isArray(equip.slot)) {
      return this.replace_slot(equip.slot, equip, innerImpact);
    }
    for (const slot of equip.slot) {
      if (!this.list[slot]) {
        return this.replace_slot(slot, equip, innerImpact);
      }
    }
    return this.replace_slot(equip.slot[0], equip, innerImpact);
  }

  protected replace_slot(
    slot: EquipSlot,
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    if (equip.type == EquipType.Weapon) {
      const mainHand = this.list[EquipSlot.MainHand];
      let isTwoHand = mainHand && mainHand.subType == WeaponType.TwoHand;
      if (isTwoHand || equip.subType == WeaponType.TwoHand) {
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
    return true;
  }

  remove(
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    let slot = this.getEquippedSlot(equip);
    if (!slot) return false;
    this.list[slot] = null;
    equip.removed(innerImpact);
    return true;
  }

  getEquippedSlot(
    equip: Equip
  ): EquipSlot {
    const slots = toArray(equip.slot) as EquipSlot[];
    for (const slot of slots) {
      const checked = this.list[slot] == equip;
      return checked ? slot : null;
    }
  }

  removeSlot(
    slot: EquipSlot,
    innerImpact: Impact
  ): boolean {
    const equip: Equip = this.list[slot];
    if (!equip) return false;
    this.list[slot] = null;
    equip.removed(innerImpact);
    return true;
  }

  getSlots(slots: EquipSlot[]): Equip[] {
    if (!slots) return null;
    const result = [];
    for (const slot of slots) {
      result.push(this.list[slot]);
    }
    return result;
  }

}
