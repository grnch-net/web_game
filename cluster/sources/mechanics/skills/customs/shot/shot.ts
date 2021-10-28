import * as UTILS from '../../../../utils/index';

import type {
  Impact
} from '../../../interactions/index';

import type {
  Equip
} from '../../../equips/index';

import {
  Skill
} from '../../skill';

@UTILS.modifiable
class Shot extends Skill {

  protected usage_equips: Equip[];

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.on_apply(innerImpact, outerImpact);
    outerImpact.rules.range = 0;
    outerImpact.rules.sector = 0;
    outerImpact.influenced.health = 0;
  }

}

Skill.AddCustomClass('shot', Shot);

export {
  Shot
}
