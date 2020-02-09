import { Skill, SkillNeedsResult } from '../skill';
import { Impact, Attributes } from '../../interactions/index';
import { Equip } from '../../equips/index';

export class Block extends Skill {
  onOuterImpact(
    impact: Impact
  ) {
    super.onOuterImpact(impact);
    if (!this.usageTime) return;
    const impact_health = impact.negative[Attributes.Health];
    if (!impact_health || impact_health < 0) return;
    const penetration = impact.rules.penetration;
    const equip = this.equips[0];
    let block = this.experience * Skill.multiplyEfficiency;
    let armor = 0;
    if (equip) {
      block += this.equips[0].stats.block;
      armor += this.equips[0].stats.armor;
    }
    const success = this.block_calculation(block, penetration);
    if (success) {
      if (impact_health < armor) {
        impact.negative[Attributes.Health] = 0;
      } else {
        impact.negative[Attributes.Health] -= armor;
      }
    }
    for (const influence of this.stock) {
      influence.apply(impact);
    }
    this.usageTime = 0;
  }

  protected block_calculation(
    block: number,
    penetration: number
  ): boolean {
    if (!penetration) return true;
    const random = Math.random() * (block + penetration);
    return random > penetration;
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
