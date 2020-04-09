import type {
  Impact,
  InteractResult
} from '../../interactions/index';

import type {
  Equip
} from '../../equips/index';

import {
  Skill,
  SkillNeedsResult
} from '../skill';


@UTILS.modifiable
class Attack extends Skill {
  protected combinations: number;
  protected usageEquip: Equip | null;

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
    if (this.usageEquip) {
      const equip_stats = this.usageEquip.stats
      outerImpact.negative.health = equip_stats.damage;
      rules.penetration = equip_stats.penetration;
      rules.range = equip_stats.range;
    } else {
      rules.range = 1;
    }
    rules.penetration += this.experience * Attack.multiplyEfficiency;
    this.combinations++;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    const success = super.checkNeeds(result);
    if (!success) return false;
    const [main_equip, second_equip] = this.equips;
    const turn_second = (this.combinations % 2) == 1;
    if (turn_second && second_equip && second_equip.stats.damage) {
      this.usageEquip = second_equip;
    } else
    if (main_equip && main_equip.stats.damage) {
      this.usageEquip = main_equip
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
