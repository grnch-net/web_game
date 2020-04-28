import type {
  Impact,
  InteractResult
} from '../../interactions/index';

import {
  EquipSlot,
  Equip
} from '../../equips/index';

import {
  Skill,
  SkillNeeds,
  SkillNeedsResult
} from '../skill';


@UTILS.modifiable
class Attack extends Skill {
  protected combination: number;
  protected usage_equip: Equip | null;

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.Hold]
    };
  }

  reset() {
    super.reset();
    this.combination = 0;
  }

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    const rules = outerImpact.rules;
    let penetration = this.experience * Attack.multiplyEfficiency;
    if (this.usage_equip) {
      const equip_stats = this.usage_equip.stats;
      outerImpact.influenced.health = -equip_stats.meleeDamage;
      penetration = equip_stats.meleePenetration;
    }
    rules.penetration = this.randomize_chance(penetration);
    rules.range = 2;
    this.combination++;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    super.checkNeeds(result);
    this.usage_equip = null;
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

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.usage_equip) {
      this.castTime = this.usage_equip.stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }

  interactResult(
    result: InteractResult
  ) {
    if (!result.hit) return;
    if (result.avoid) {
      this.parameters.experience += 1;
    }
    if (this.usage_equip) {
      this.usage_equip.durability -= 1;
    }
  }
}

Skill.AddCustomClass('attack', Attack);

export {
  Attack
}
