import type {
  Impact
} from '../../../interactions/index';

import {
  Parry
} from '../../customs/parry';

type Mod = Modifiable<typeof Parry>;

class ParryPenetration extends (Parry as Mod).Latest {

  protected check_parry(
    innerImpact: Impact,
  ): boolean {
    const result = super.check_parry(innerImpact);
    if (!result) {
      return;
    }
    const chance = this.calculate_parry_chance();
    const { penetration } = innerImpact.rules;
    return chance >= penetration;
  }

  protected calculate_parry_chance(): number {
    return 0;
  }

}

(Parry as Mod).modify(ParryPenetration, 'Penetration');

export type {
  ParryPenetration
}
