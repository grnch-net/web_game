console.info('skills/modifications/experience/shot');

import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Shot
} from '../../customs/shot';

type Mod = Modifiable<typeof Shot>;

class ShotExperience extends (Shot as Mod).Latest {

  protected calculate_penetration(
    outerImpact: Impact
  ): number {
    let result = super.calculate_penetration(outerImpact);
    result += this.parameters.experience * Shot.multiplyEfficiency;
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

(Shot as Mod).modify(ShotExperience);
