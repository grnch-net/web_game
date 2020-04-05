import {
  Impact,
  ImpactSide,
  InteractResult
} from '../../interactions/index';

import {
  Skill
} from '../skill';

class Block extends Skill {

  onOuterImpact(
    impact: Impact
  ): InteractResult {
    const result = super.onOuterImpact(impact);
    if (!this.usageTime) return;
    const damage = impact.negative.health;
    const { stun, side, penetration } = impact.rules;
    if (!damage && !stun) return;
    if (side !== ImpactSide.Front) return;
    const equip = this.equips[0];
    let block = this.experience * Block.multiplyEfficiency;
    let armor = 0;
    if (equip) {
      block += equip.stats.block;
      armor += equip.stats.armor;
    }
    result.avoid = this.block_calculation(block, penetration);
    if (result.avoid) {
      this.apply_block(impact, armor);
      this.apply_stock(impact);
    } else {
      this.parameters.experience += 1;
    }
    this.usageTime = 0;
    return result;
  }

  protected apply_stock(
    impact: Impact
  ) {
    for (const influence of this.stock) {
      influence.apply(impact);
    }
  }

  protected block_calculation(
    block: number,
    penetration: number
  ): boolean {
    if (!penetration) return true;
    const random = Math.random() * (block + penetration);
    return random > penetration;
  }

  protected apply_block(
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

Skill.AddCustomClass('block', Block);

export {
  Block
}
