console.info('skills/modifications/experience/attack');

import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Attack
} from '../../customs/attack';

type Mod = Modifiable<typeof Attack>;

class AttackExperience extends (Attack as Mod).Latest {

  protected calculate_penetration(
    outerImpact: Impact
  ): number {
    let result = super.calculate_penetration(outerImpact);
    result += this.experience * Attack.multiplyEfficiency;
    return result;
  }

  interactResult(
    result: InteractResult
  ) {
    super.interactResult(result);
    if (!result.hit) return;
    if (result.avoid) {
      this.parameters.experience += 1;
    }
  }

}

(Attack as Mod).modify(AttackExperience);
