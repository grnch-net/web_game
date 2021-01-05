console.info('skills/modifications/penetration/attack');

import type {
  Impact
} from '../../../interactions/index';

import {
  Attack
} from '../../customs/attack';

type Mod = Modifiable<typeof Attack>;

class AttackPenetration extends (Attack as Mod).Latest {

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    outerImpact.rules.penetration = this.calculate_penetration(outerImpact);
  }

}

(Attack as Mod).modify(AttackPenetration);
