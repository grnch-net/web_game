import {
  Equip, EquipParameters, EquipSlot, EquipType, WeaponType
} from './equip';
import { utils } from './equips_utils';
import { Impact } from '../interactions/index';

export class Controller {
  protected slots: { [key in EquipSlot]?: Equip };

  initialize(
    list: EquipParameters[],
    innerImpact: Impact
  ) {
    this.slots = {};
    for (const parameters of list) {
      const equip = utils.create(parameters);
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
      if (!this.slots[slot]) {
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
