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
  protected usage_equips: Equip[] | null;

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
    let parry = this.experience * Parry.multiplyEfficiency;
    let defense = 0;
    for (const equip of this.usage_equips) {
      parry += equip.stats.parry;
      defense += equip.stats.defense;
    }
    const chance = this.randomize_chance(parry);
    result.avoid = chance > penetration;
    if (result.avoid) {
      this.stock.apply(innerImpact.influenced);
      this.apply_parry(innerImpact, defense);
      for (const equip of this.usage_equips) {
        equip.durability -= 1;
      }
    } else {
      this.parameters.experience += 1;
    }
    this.usageTime = 0;
    return result;
  }

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

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    super.checkNeeds(result);
    this.usage_equips = [];
    for (const equip of result.equips) {
      if (equip && equip.stats.parry) {
        this.usage_equips.push(equip)
      }
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    let equips_speed = 0;
    for (const equip of this.usage_equips) {
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
