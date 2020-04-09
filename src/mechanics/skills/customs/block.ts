import type {
  Equip
} from '../../equips/index';

import {
  Impact,
  ImpactSide,
  InteractResult
} from '../../interactions/index';

import {
  Skill,
  SkillNeedsResult
} from '../skill';


class Block extends Skill {
  protected usageEquip: Equip | null;

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ): InteractResult {
    super.onOuterImpact(innerImpact, result);
    if (!this.usageTime) return;
    const damage = innerImpact.negative.health;
    const { stun, side, penetration } = innerImpact.rules;
    if (!damage && !stun) return;
    if (side !== ImpactSide.Front) return;
    let block = this.experience * Block.multiplyEfficiency;
    let armor = 0;
    if (this.usageEquip) {
      block += this.usageEquip.stats.block;
      armor += this.usageEquip.stats.armor;
    }
    result.avoid = this.block_calculation(block, penetration);
    if (result.avoid) {
      this.apply_block(innerImpact, armor);
      this.apply_stock(innerImpact);
      if (this.usageEquip) {
        this.usageEquip.durability -= 1;
      }
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

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    const success = super.checkNeeds(result);
    if (!success) return false;
    const [equip] = this.equips;
    if (equip && equip.stats.block) {
      this.usageEquip = equip
    } else {
      this.usageEquip = null;
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.usageEquip && this.usageEquip.stats.speed) {
      this.castTime = this.usageEquip.stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }
}

Skill.AddCustomClass('block', Block);

export {
  Block
}
