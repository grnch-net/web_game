import type {
  Impact,
} from '../interactions/index';

import {
  World
} from './world';

type Mod = Modifiable<typeof World>;

class WorldPenetration extends (World as Mod).Latest {

  // TODO: move to InteractionController
  // protected apply_range(
  //   distance: number,
  //   impact: Impact
  // ) {
  //   if (distance < 2) return;
  //   impact.rules.penetration -= distance;
  // }

}

(World as Mod).modify(WorldPenetration);
