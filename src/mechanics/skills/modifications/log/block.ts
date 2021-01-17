import type {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Block
} from '../../customs/block';

type Mod = Modifiable<typeof Block>;

class BlockLog extends (Block as Mod).Latest {

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ) {
    super.onOuterImpact(innerImpact, result);
    console.info('Block', result.avoid);
  }

}

(Block as Mod).modify(BlockLog);
