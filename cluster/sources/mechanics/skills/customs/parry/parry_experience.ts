import {
  Parry
} from './parry';

import type {
  SkillConfig,
  SkillParameters
} from '../../skill';

import type {
  ParryPenetration
} from './parry_penetration';

type Mod = Modifiable<typeof Parry>;

function ModCall(Latest: typeof ParryPenetration) {
  class ParryExperience extends Latest {

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

    protected calculate_parry_chance(): number {
      let chance = super.calculate_parry_chance();
      chance += this.parameters.experience * Parry.multiplyEfficiency;
      return chance;
    }

    protected fail_parry() {
      super.fail_parry();
      this.parameters.experience += 1;
    }

  }
  return ParryExperience;
}

(Parry as Mod).modifyAfter('Penetration', ModCall);

interface ParryExperience extends ParryPenetration {}

export type {
  ParryExperience
}
