import {
  Impact,
  ImpactSide,
  InteractResult
} from '../../interactions/index';

import {
  Skill,
  SkillNeeds,
  SkillNeedsResult
} from '../skill';

import {
  EquipSlot,
  Equip
} from '../../equips/index';

class Block extends Skill {
  protected usageEquip: Equip | null;

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.SecondHand]
    };
  }

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
    let defense = 0;
    if (this.usageEquip) {
      block += this.usageEquip.stats.block;
      defense += this.usageEquip.stats.defense;
    }
    const chance = this.randomize_chance(block);
    result.avoid = chance > penetration;
    if (result.avoid) {
      this.apply_block(innerImpact, defense);
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

  protected apply_block(
    impact: Impact,
    defense: number
  ) {
    if (impact.negative.health) {
      if (impact.negative.health < defense) {
        impact.negative.health = 0;
      } else {
        impact.negative.health -= defense;
      }
    }
    if (impact.rules.stun) {
      delete impact.rules.stun;
    }
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    super.checkNeeds(result);
    const [equip] = result.equips;
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
