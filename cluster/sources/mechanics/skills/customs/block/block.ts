import * as UTILS from '../../../../utils/index';

import {
  Impact,
  ImpactSide,
  TargetInteractResult
} from '../../../interactions/index';

import type {
  Equip
} from '../../../equips/index';

import {
  Skill,
  SkillState
} from '../../skill';

@UTILS.modifiable
class Block extends Skill {

  protected usage_equip: Equip | null;

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
    result.avoid = this.check_block(innerImpact);
    if (result.avoid) {
      this.avoid_block(innerImpact);
    } else {
      this.fail_block();
    }
    this.onCancel();
  }

  protected check_block(
    innerImpact: Impact
  ): boolean {
    return true;
  }

  protected avoid_block(
    innerImpact: Impact
  ) {
    let defense = this.calculate_defence();
    this.stock.apply(innerImpact.influenced);
    this.apply_block(innerImpact, defense);
  }

  protected calculate_defence(): number {
    return this.config.stats?.defense || 0;
  }

  protected fail_block() {}

  protected apply_block(
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

Skill.AddCustomClass('block', Block);

export {
  Block
}
