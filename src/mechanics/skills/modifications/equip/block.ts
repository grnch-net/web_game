import type {
  Impact
} from '../../../interactions/index';

import {
  EquipSlot
} from '../../../equips/index';

import type {
  SkillNeeds,
  SkillNeedsResult
} from '../../skill';

import {
  Block
} from '../../customs/block';

type Mod = Modifiable<typeof Block>;

class BlockEquip extends (Block as Mod).Latest {

  get_needs(): SkillNeeds {
    const result = super.get_needs();
    result.equips = result.equips || [];
    result.equips.push(EquipSlot.Hold);
    return result;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.usage_equip = null;
    const checked = super.checkNeeds(result);
    if (!checked) {
      return false;
    }
    for (const equip of result.equips) {
      if (equip?.stats?.block) {
        this.usage_equip = equip
        break;
      }
    }
    return true;
  }

  protected calculate_block_chance(): number {
    let chance = super.calculate_block_chance();
    const equip_chance = this.usage_equip?.stats?.block;
    if (equip_chance) {
      chance += this.randomize_chance(equip_chance);
    }
    return chance;
  }

  protected avoid_block(
    innerImpact: Impact
  ) {
    super.avoid_block(innerImpact);
    if (this.usage_equip) {
      this.usage_equip.durability -= 1;
    }
  }

  protected calculate_defence(): number {
    let defense = super.calculate_defence();
    defense += this.usage_equip?.stats?.defense || 0;
    return defense;
  }

  protected get_cast_time(): number {
    const cast_time = super.get_cast_time();
    const equip_speed = this.usage_equip?.stats?.speed;
    if (equip_speed) {
      // return Math.max(equip_speed, cast_time);
      return equip_speed;
    }
    return cast_time;
  }

}

(Block as Mod).modify(BlockEquip);
