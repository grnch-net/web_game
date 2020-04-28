import type {
  Impact,
  InteractResult
} from '../../interactions/index';

import {
  EquipSlot,
  EquipSubType,
  Equip
} from '../../equips/index';

import {
  Skill,
  SkillNeeds,
  SkillNeedsResult
} from '../skill';

const rangeEquips = [
  EquipSubType.Bow,
  EquipSubType.Thrown
];
const ammoEquips = [
  EquipSubType.Arrow
];

class Shot extends Skill {
  protected usage_equips: Equip[];

  get needs(): SkillNeeds {
    return {
      equips: [EquipSlot.Hold]
    };
  }

  reset() {
    super.reset();
  }

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    const rules = outerImpact.rules;
    let penetration = this.experience * Shot.multiplyEfficiency;
    let range = 0;
    let damage = 0;
    for (const equip of this.usage_equips) {
      penetration += equip.stats.rangePenetration || 0;
      range += equip.stats.range || 0;
      damage += equip.stats.rangeDamage || 0;
    }
    rules.penetration = this.randomize_chance(penetration);
    rules.range = range;
    rules.sector = Math.PI * 0.125;
    outerImpact.influenced.health = -damage;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.usage_equips = [];
    super.checkNeeds(result);
    let main_hand: Equip;
    let off_hand: Equip;
    for (const equip of result.equips) {
      if (rangeEquips.includes(equip.subType)) {
        main_hand = equip;
      } else
      if (ammoEquips.includes(equip.subType)) {
        off_hand = equip;
      }
    }
    if (!main_hand) return false;
    if (main_hand.subType == EquipSubType.Thrown) {
      this.usage_equips.push(main_hand);
    } else
    if (main_hand.subType == EquipSubType.Bow) {
      if (!off_hand || off_hand.subType != EquipSubType.Arrow) {
        return false;
      }
      this.usage_equips.push(main_hand, off_hand);
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.usage_equips) {
      this.castTime = this.usage_equips[0].stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }

  interactResult(
    result: InteractResult
  ) {
    if (!result.hit) return;
    if (result.avoid) {
      this.parameters.experience += 1;
    }
  }
}

Skill.AddCustomClass('shot', Shot);

export {
  Shot
}
