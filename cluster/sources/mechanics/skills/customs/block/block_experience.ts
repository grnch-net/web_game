import {
  Block
} from './block';

import type {
  SkillConfig,
  SkillParameters
} from '../../skill';

import type {
  BlockPenetration
} from '../../modifications/penetration/block';

type Mod = Modifiable<typeof Block>;

function ModCall(Latest: typeof BlockPenetration) {
  class BlockExperience extends Latest {

    initialize(
      config: SkillConfig,
      parameters: SkillParameters
    ) {
      super.initialize(config, parameters);
      this.initialize_experience();
    }

    initialize_experience() {
      this.parameters.experience = 0
    }

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
  return BlockExperience;
}

(Block as Mod).modifyAfter('Penetration', ModCall);

interface BlockExperience extends BlockPenetration {}

export type {
  BlockExperience
}
