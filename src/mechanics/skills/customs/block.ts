import {
  Impact,
  ImpactSide,
  InteractResult
} from '../../interactions/index';

import {
  Skill
} from '../skill';

import type {
  Equip
} from '../../equips/index';

@UTILS.modifiable
class Block extends Skill {

  protected usage_equip: Equip | null;

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ) {
    super.onOuterImpact(innerImpact, result);
    if (!this.usageTime) return;
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
    this.usageTime = 0;
  }

  protected check_block(
    innerImpact: Impact
  ): boolean {
    return true;
  }

  protected calculate_block_chance(): number {
    return 0;
  }

  protected avoid_block(
    innerImpact: Impact
  ) {
    let defense = this.calculate_defence();
    this.stock.apply(innerImpact.influenced);
    this.apply_block(innerImpact, defense);
  }

  protected calculate_defence(): number {
    return 0;
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
