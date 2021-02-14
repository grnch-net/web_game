import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Equip,
  EquipSlot
} from '../../../equips/index';

import type {
  SkillNeeds,
  SkillNeedsResult
} from '../../skill';

import {
  Attack
} from '../../customs/attack';

import type {
  AttackPenetration
} from '../penetration/attack';

type Mod = Modifiable<typeof Attack>;

class AttackEquip extends (Attack as Mod).Latest {

  get_needs(): SkillNeeds {
    const result = super.get_needs();
    result.equips = result.equips || [];
    result.equips.push(EquipSlot.Hold);
    return result;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.usage_equip = null;
    const checked = super.checkNeeds(result);
    if (!checked) {
      return false;
    }
    let main_hand: Equip;
    let off_hand: Equip;
    for(const equip of result.equips) {
      if (equip.stats.meleeDamage) {
        if (main_hand) {
          off_hand = equip;
        } else {
          main_hand = equip;
        }
      }
    }
    const turn_second = (this.combination % 2) == 1;
    if (turn_second && off_hand) {
      this.usage_equip = off_hand;
    } else
    if (main_hand) {
      this.usage_equip = main_hand
    }
    return true;
  }


  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    outerImpact.influenced.health += -this.usage_equip?.stats?.meleeDamage || 0;
  }

  protected get_cast_time(): number {
    const cast_time = super.get_cast_time();
    const equip_speed = this.usage_equip?.stats?.speed;
    if (equip_speed) {
      // return Math.max(equip_speed, cast_time);
      return equip_speed;
    }
    return cast_time;
  }

  interactResult(
    results: InteractResult[]
  ) {
    super.interactResult(results);
    for (const result of results) {
      if (!result.hit) return;
      if (this.usage_equip) {
        this.usage_equip.durability -= 1;
      }
    }
  }

}

(Attack as Mod).modify(AttackEquip, 'Equip');

function ModCall(Latest: typeof AttackPenetration) {
  class AttackEquip_Penetration extends Latest {

    protected calculate_penetration(
      outerImpact: Impact
    ): number {
      let result = super.calculate_penetration(outerImpact);
      let penetration = this.usage_equip?.stats?.meleePenetration || 0;
      result += penetration;
      // TODO: Mod randomize
      // result += this.randomize_chance(penetration);
      return result;
    }

  }
  return AttackEquip_Penetration;
}


(Attack as Mod).modifyAfter('Penetration', ModCall, 'Equip_Penetration');

interface AttackEquip_Penetration extends AttackPenetration {}

export type {
  AttackEquip,
  AttackEquip_Penetration
}
