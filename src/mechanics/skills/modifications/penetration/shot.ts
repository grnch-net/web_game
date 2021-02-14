import type {
  Impact
} from '../../../interactions/index';

import {
  Shot
} from '../../customs/shot';

type Mod = Modifiable<typeof Shot>;

class ShotPenetration extends (Shot as Mod).Latest {

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
    return 0;
  }

}

(Shot as Mod).modify(ShotPenetration, 'Penetration');

export type {
  ShotPenetration
}
