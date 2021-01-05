console.info('skills/modifications/experience/parry');

import {
  Parry
} from '../../customs/parry';

type Mod = Modifiable<typeof Parry>;

class ParryExperience extends (Parry as Mod).Latest {

  protected calculate_parry_chance(): number {
    let chance = super.calculate_parry_chance();
    chance += this.experience * Parry.multiplyEfficiency;
    return chance;
  }

  protected fail_parry() {
    super.fail_parry();
    this.parameters.experience += 1;
  }

}

(Parry as Mod).modify(ParryExperience);
