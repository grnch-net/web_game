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

  protected usage_equip: Equip | null;

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.Hold]
    };
  }

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ): InteractResult {
    super.onOuterImpact(innerImpact, result);
    if (!this.usageTime) return;
    const { stun, side, penetration } = innerImpact.rules;
    const damage = innerImpact.influenced.health < 0;
    if (!damage && !stun) return;
    if (side !== ImpactSide.Front) return;
    let block = this.experience * Block.multiplyEfficiency;
    let defense = 0;
    if (this.usage_equip) {
      block += this.usage_equip.stats.block;
      defense += this.usage_equip.stats.defense;
    }
    const chance = this.randomize_chance(block);
    result.avoid = chance > penetration;
    if (result.avoid) {
      this.stock.apply(innerImpact.influenced);
      this.apply_block(innerImpact, defense);
      if (this.usage_equip) {
        this.usage_equip.durability -= 1;
      }
    } else {
      this.parameters.experience += 1;
    }
    this.usageTime = 0;
    return result;
  }

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

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    super.checkNeeds(result);
    this.usage_equip = null;
    for (const equip of result.equips) {
      if (equip && equip.stats.block) {
        this.usage_equip = equip
        break;
      }
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.usage_equip && this.usage_equip.stats.speed) {
      this.castTime = this.usage_equip.stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }

}

Skill.AddCustomClass('block', Block);

export {
  Block
}
