console.info('skills/modifications/equip/shot');

import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  EquipSlot,
  EquipSubType,
  Equip
} from '../../../equips/index';

import type {
  SkillNeeds,
  SkillNeedsResult
} from '../../skill';

import {
  Shot
} from '../../customs/shot';

type Mod = Modifiable<typeof Shot>;

const rangeEquips = [
  EquipSubType.Bow,
  EquipSubType.Thrown
]

const ammoEquips = [
  EquipSubType.Arrow
]

class ShotEquip extends (Shot as Mod).Latest {

  get_needs(): SkillNeeds {
    const result = super.get_needs();
    result.equips = result.equips || [];
    result.equips.push(EquipSlot.Hold);
    return result;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.usage_equips = [];
    const checked = super.checkNeeds(result);
    if (!checked) {
      return false;
    }
    let main_hand: Equip;
    let off_hand: Equip;
    for (const equip of result.equips) {
      if (rangeEquips.includes(equip.subType)) {
        main_hand = equip;
      } else
      if (ammoEquips.includes(equip.subType)) {
        off_hand = equip;
      }
    }
    if (!main_hand) {
      return false;
    }
    if (main_hand.subType == EquipSubType.Thrown) {
      this.usage_equips.push(main_hand);
    } else
    if (main_hand.subType == EquipSubType.Bow) {
      if (!off_hand || off_hand.subType != EquipSubType.Arrow) {
        return false;
      }
      this.usage_equips.push(main_hand, off_hand);
    }
    return true;
  }


  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    for (const equip of this.usage_equips) {
      outerImpact.rules.range += equip.stats?.range || 0;
      outerImpact.influenced.health += -equip.stats?.rangeDamage || 0;
    }
  }

  protected calculate_penetration(
    outerImpact: Impact
  ): number {
    let result = super.calculate_penetration(outerImpact);
    let penetration = 0;
    for (const equip of this.usage_equips) {
      penetration += equip.stats?.rangePenetration || 0;
    }
    result += this.randomize_chance(penetration);
    return result;
  }

  protected update_cast_time() {
    super.update_cast_time();
    for (const equip of this.usage_equips) {
      this.castTime += equip.stats?.speed || 0;
    }
  }

  interactResult(
    result: InteractResult
  ) {
    super.interactResult(result);
    if (!result.hit) return;
    for (const equip of this.usage_equips) {
      equip.durability -= 1;
    }
  }

}

(Shot as Mod).modify(ShotEquip);