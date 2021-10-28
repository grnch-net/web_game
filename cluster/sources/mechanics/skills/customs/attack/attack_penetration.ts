import type {
  Impact
} from '../../../interactions/index';

import {
  Attack
} from './attack';

type Mod = Modifiable<typeof Attack>;

class AttackPenetration extends (Attack as Mod).Latest {

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    outerImpact.rules.penetration = this.calculate_penetration(outerImpact);
  }

  protected calculate_penetration(
    outerImpact: Impact
  ): number {
    return this.config.stats?.penetration || 0;
  }

}

(Attack as Mod).modify(AttackPenetration, 'Penetration');

export type {
  AttackPenetration
}
