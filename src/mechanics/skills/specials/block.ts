import { Skill } from '../skill';
import {
  Impact, ImpactSide, InteractResult
} from '../../interactions/index';

export class Block extends Skill {
  onOuterImpact(
    impact: Impact
  ): InteractResult {
    const result = super.onOuterImpact(impact);
    if (!this.usageTime) return;
    const impact_health = impact.negative.health;
    const impact_stun = impact.rules.stun;
    const impact_side = impact.rules.side;
    if (!impact_health && !impact_stun) return;
    if (impact_side !== ImpactSide.Front) return;
    const penetration = impact.rules.penetration;
    const equip = this.equips[0];
    let block = this.experience * Skill.multiplyEfficiency;
    let armor = 0;
    if (equip) {
      block += equip.stats.block;
      armor += equip.stats.armor;
    }
    result.avoid = this.block_calculation(block, penetration);
    if (result.avoid) {
      this.block_apply(impact, armor);
    } else {
      this.parameters.experience += 1;
    }
    for (const influence of this.stock) {
      influence.apply(impact);
    }
    this.usageTime = 0;
    return result;
  }

  protected block_calculation(
    block: number,
    penetration: number
  ): boolean {
    if (!penetration) return true;
    const random = Math.random() * (block + penetration);
    return random > penetration;
  }

  protected block_apply(
    impact: Impact,
    armor: number
  ) {
    if (impact.negative.health) {
      if (impact.negative.health < armor) {
        impact.negative.health = 0;
      } else {
        impact.negative.health -= armor;
      }
    }
    if (impact.rules.stun) {
      delete impact.rules.stun;
    }
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    const equip = this.equips[0];
    if (equip && equip.stats.speed) {
      this.castTime = equip.stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }
}
