import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Attack
} from './attack';

import type {
  SkillConfig,
  SkillParameters
} from '../../skill';

import type {
  AttackPenetration
} from '../../modifications/penetration/attack';

type Mod = Modifiable<typeof Attack>;

function ModCall(Latest: typeof AttackPenetration) {
  class AttackExperience extends Latest {

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
      result += this.parameters.experience * Attack.multiplyEfficiency;
      return result;
    }

    interactResult(
      results: InteractResult
    ) {
      super.interactResult(results);
      for (const result of results.targets) {
        if (!result.hit) return;
        if (result.avoid) {
          this.parameters.experience += 1;
        }
      }
    }

  }
  return AttackExperience;
}


(Attack as Mod).modifyAfter('Penetration', ModCall);

interface AttackExperience extends AttackPenetration {}

export type {
  AttackExperience
}
