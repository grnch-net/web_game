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
  protected combinations: number;
  protected usageEquip: Equip | null;

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.MainHand, EquipSlot.SecondHand]
    };
  }

  reset() {
    super.reset();
    this.combinations = 0;
  }

  protected on_cast_complete(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_cast_complete(innerImpact, outerImpact);
    const rules = outerImpact.rules;
    let penetration = this.experience * Attack.multiplyEfficiency;
    if (this.usageEquip) {
      const equip_stats = this.usageEquip.stats
      outerImpact.negative.health = equip_stats.damage;
      rules.range = equip_stats.range;
      penetration = equip_stats.penetration;
    } else {
      rules.range = 1;
    }
    rules.penetration = this.randomize_chance(penetration);
    this.combinations++;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    super.checkNeeds(result);
    const [main_hand, second_hand] = result.equips;
    const turn_second = (this.combinations % 2) == 1;
    if (turn_second && second_hand && second_hand.stats.damage) {
      this.usageEquip = second_hand;
    } else
    if (main_hand && main_hand.stats.damage) {
      this.usageEquip = main_hand
    } else {
      this.usageEquip = null;
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.usageEquip) {
      this.castTime = this.usageEquip.stats.speed;
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
    if (this.usageEquip) {
      this.usageEquip.durability -= 1;
    }
  }
}

Skill.AddCustomClass('attack', Attack);

export {
  Attack
}
