import {
  Impact,
  ImpactSide,
  TargetInteractResult
} from '../../interactions/index';

import type {
  Equip
} from '../../equips/index';

import {
  Skill,
  SkillState
} from '../skill';

@UTILS.modifiable
class Parry extends Skill {

  protected usage_equips: Equip[] | null;

  onOuterImpact(
    innerImpact: Impact,
    result: TargetInteractResult
  ) {
    super.onOuterImpact(innerImpact, result);
    if (this.state !== SkillState.Usage) return;
    const { stun, side } = innerImpact.rules;
    const is_damage = innerImpact.influenced.health < 0;
    if (!is_damage && !stun) return;
    if (side !== ImpactSide.Front) return;
    result.avoid = this.check_parry(innerImpact);
    if (result.avoid) {
      this.avoid_parry(innerImpact);
    } else {
      this.fail_parry();
    }
    this.usageTimer.end();
  }

  protected check_parry(
    innerImpact: Impact
  ): boolean {
    return true;
  }

  protected avoid_parry(
    innerImpact: Impact
  ) {
    let defense = this.calculate_defence();
    this.stock.apply(innerImpact.influenced);
    this.apply_parry(innerImpact, defense);
  }

  protected calculate_defence(): number {
    return 0;
  }

  protected fail_parry() {}

  protected apply_parry(
    impact: Impact,
    defense: number
  ) {
    const damage = -impact.influenced.health;
    if (damage > 0) {
      if (damage > defense) {
        impact.influenced.health += defense;
      } else {
        impact.influenced.health = 0;
      }
    }
    if (impact.rules.stun) {
      delete impact.rules.stun;
    }
  }

}

Skill.AddCustomClass('parry', Parry);

export {
  Parry
}
