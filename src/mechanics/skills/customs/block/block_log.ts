import type {
  Impact,
  TargetInteractResult
} from '../../../interactions/index';

import {
  Block
} from '../../customs/block';

type Mod = Modifiable<typeof Block>;

class BlockLog extends (Block as Mod).Latest {

  onOuterImpact(
    innerImpact: Impact,
    result: TargetInteractResult
  ) {
    super.onOuterImpact(innerImpact, result);
    console.info('Block', result.avoid);
  }

}

(Block as Mod).modify(BlockLog);
