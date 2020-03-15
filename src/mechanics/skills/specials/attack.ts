import { Skill, SkillNeedsResult } from '../skill';
import { Impact, InteractResult } from '../../interactions/index';

export class Attack extends Skill {
  protected combinations: number;

  reset() {
    super.reset();
    this.combinations = 0;
  }

  protected on_cast_complete(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_cast_complete(innerImpact, outerImpact);
    const [main_equip, second_equip] = this.equips;
    const turn_second = (this.combinations % 2) == 1;
    if (second_equip && turn_second) {
      outerImpact.negative.health = second_equip.stats.damage;
      outerImpact.rules.penetration = second_equip.stats.penetration;
      outerImpact.rules.range = second_equip.stats.range;
    } else
    if (main_equip) {
      outerImpact.negative.health = main_equip.stats.damage;
      outerImpact.rules.penetration = main_equip.stats.penetration;
      outerImpact.rules.range = main_equip.stats.range;
    } else {
      outerImpact.rules.range = 1;
    }
    outerImpact.rules.penetration += this.experience * Skill.multiplyEfficiency;
    this.combinations++;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    const success = super.checkNeeds(result);
    if (!success) return false;
    this.equips = [];
    for (const equip of result.equips) {
      equip.stats.damage && this.equips.push(equip);
    }
    return true;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    const [main_equip, second_equip] = this.equips;
    const turn_second = (this.combinations % 2) == 1;
    if (second_equip && turn_second) {
      this.castTime = second_equip.stats.speed;
    } else
    if (main_equip) {
      this.castTime = main_equip.stats.speed;
    }
    super.use(innerImpact, outerImpact);
  }

  interactResult(
    result: InteractResult
  ) {
    if (result.avoid) {
      this.parameters.experience += 1;
    }
  }
}
