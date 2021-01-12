import type {
  Impact
} from '../../interactions/index';

import type {
  Equip
} from '../../equips/index';

import {
  Skill
} from '../skill';

@UTILS.modifiable
class Attack extends Skill {

  protected combination: number;
  protected usage_equip: Equip | null;

  reset() {
    super.reset();
    this.combination = 0;
  }

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    outerImpact.rules.range = 2;
    this.combination++;
  }

  protected calculate_penetration(
    outerImpact: Impact
  ): number {
    return this.config.stats?.penetration || 0;
  }

}

Skill.AddCustomClass('attack', Attack);

export {
  Attack
}
