console.info('skills/modifications/experience/block');

import {
  Block
} from '../../customs/block';

type Mod = Modifiable<typeof Block>;

class BlockExperience extends (Block as Mod).Latest {

  protected calculate_block_chance(): number {
    let chance = super.calculate_block_chance();
    chance += this.parameters.experience * Block.multiplyEfficiency;
    return chance;
  }

  protected fail_block() {
    super.fail_block();
    this.parameters.experience += 1;
  }

}

(Block as Mod).modify(BlockExperience);
