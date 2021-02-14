import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Shot
} from '../../customs/shot';

import type {
  SkillConfig,
  SkillParameters
} from '../../skill';

import type {
  ShotPenetration
} from '../penetration/shot';

type Mod = Modifiable<typeof Shot>;

function ModCall(Latest: typeof ShotPenetration) {
  class ShotExperience extends Latest {

    initialize(
      config: SkillConfig,
      parameters: SkillParameters
    ) {
      super.initialize(config, parameters);
      this.initialize_experience();
    }

    initialize_experience() {
      this.parameters.experience = 0
    }

    protected calculate_penetration(
      outerImpact: Impact
    ): number {
      let result = super.calculate_penetration(outerImpact);
      result += this.parameters.experience * Shot.multiplyEfficiency;
      return result;
    }

    interactResult(
      results: InteractResult[]
    ) {
      super.interactResult(results);
      for (const result of results) {
        if (!result.hit) return;
        if (result.avoid) {
          this.parameters.experience += 1;
        }
      }
    }

  }
  return ShotExperience;
}

(Shot as Mod).modifyAfter('Penetration', ModCall);

interface ShotExperience extends ShotPenetration {}

export type {
  ShotExperience
}
