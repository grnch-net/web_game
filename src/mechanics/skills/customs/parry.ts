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

class Parry extends Skill {
  protected usageEquips: Equip[] | null;

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.MainHand, EquipSlot.SecondHand]
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
    let parry = this.experience * Parry.multiplyEfficiency;
    let defense = 0;
    for (const equip of this.usageEquips) {
      parry += equip.stats.parry;
      defense += equip.stats.defense;
    }
    const chance = this.randomize_chance(parry);
    result.avoid = chance > penetration;
    if (result.avoid) {
      this.apply_parry(innerImpact, defense);
      this.apply_stock(innerImpact);
      for (const equip of this.usageEquips) {
        equip.durability -= 1;
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

  protected apply_parry(
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
    this.usageEquips = [];
    for (const equip of result.equips) {
      if (equip && equip.stats.parry) {
        this.usageEquips.push(equip)
      }
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    let equips_speed = 0;
    for (const equip of this.usageEquips) {
      if (equip.stats.speed && equip.stats.speed > equips_speed) {
        equips_speed = equip.stats.speed;
      }
    }
    if (equips_speed) {
      this.castTime = equips_speed * 0.5;
    }
    super.use(innerImpact, outerImpact);
  }
}

Skill.AddCustomClass('parry', Parry);

export {
  Parry
}
