import type {
  Impact
} from '../../../interactions/index';

import {
  Block
} from '../../customs/block';

type Mod = Modifiable<typeof Block>;

class BlockPenetration extends (Block as Mod).Latest {

  protected check_block(
    innerImpact: Impact,
  ): boolean {
    const result = super.check_block(innerImpact);
    if (!result) {
      return;
    }
    const chance = this.calculate_block_chance();
    const { penetration } = innerImpact.rules;
    return chance > penetration;
  }

}

(Block as Mod).modify(BlockPenetration);
