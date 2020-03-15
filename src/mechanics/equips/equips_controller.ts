import { Equip, EquipSlot, EquipType, WeaponType } from './equip';
import { Impact } from '../interactions/index';

export class Controller {
  slots: ({ [key in EquipSlot]?: Equip });
  mainHand: Equip;
  secondHand: Equip;
  head: Equip;
  body: Equip;
  bag: Equip;

  initialize() {}

  add(
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    if (!Array.isArray(equip.slot)) {
      return this.replace_slot(equip.slot, equip, innerImpact);
    }
    for (const slot of equip.slot) {
      if (!this.slots[slot]) {
        return this.replace_slot(slot, equip, innerImpact);
      }
    }
    return this.replace_slot(equip.slot[0], equip, innerImpact);
  }

  replace_slot(
    slot: EquipSlot,
    equip: Equip,
    innerImpact: Impact
  ): boolean {
    if (equip.type == EquipType.Weapon) {
      const mainHand = this.slots[EquipSlot.MainHand];
      let isTwoHand = mainHand && mainHand.subType == WeaponType.TwoHand;
      if (isTwoHand || equip.subType == WeaponType.TwoHand) {
        this.remove(EquipSlot.MainHand, innerImpact);
        this.remove(EquipSlot.SecondHand, innerImpact);
      } else {
        this.remove(slot, innerImpact);
      }
    } else {
      this.remove(slot, innerImpact);
    }
    this.slots[slot] = equip;
    equip.added(innerImpact);
    return true;
  }

  remove(
    slot: EquipSlot,
    innerImpact: any
  ): boolean {
    const equip: Equip = this.slots[slot];
    if (!equip) return false;
    this.slots[slot] = null;
    equip.removed(innerImpact);
    return true;
  }

  getSlot(slot: EquipSlot): Equip {
    return this.slots[slot];
  }

}
