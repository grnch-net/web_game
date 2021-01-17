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
  Parry
} from '../../customs/parry';

type Mod = Modifiable<typeof Parry>;

class ParryEquip extends (Parry as Mod).Latest {

  get_needs(): SkillNeeds {
    const result = super.get_needs();
    result.equips = result.equips || [];
    result.equips.push(EquipSlot.Hold);
    return result;
  }

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.usage_equips = [];
    const checked = super.checkNeeds(result);
    if (!checked) {
      return false;
    }
    for (const equip of result.equips) {
      if (equip?.stats?.parry) {
        this.usage_equips.push(equip)
      }
    }
    return true;
  }

  protected calculate_parry_chance(): number {
    let chance = super.calculate_parry_chance();
    let equip_chance = 0;
    for (const equip of this.usage_equips) {
      equip_chance += equip.stats?.parry || 0;
    }
    chance += this.randomize_chance(equip_chance);
    return chance;
  }

  protected avoid_parry(
    innerImpact: Impact
  ) {
    super.avoid_parry(innerImpact);
    for (const equip of this.usage_equips) {
      equip.durability -= 1;
    }
  }

  protected calculate_defence(): number {
    let defense = super.calculate_defence();
    for (const equip of this.usage_equips) {
      defense += equip.stats?.defense || 0;
    }
    return defense;
  }

  protected get_cast_time(): number {
    let cast_time = super.get_cast_time();
    let equips_speed = 0;
    for (const equip of this.usage_equips) {
      if (equip.stats?.speed && equip.stats.speed > equips_speed) {
        equips_speed = equip.stats.speed;
      }
    }
    if (equips_speed) {
      cast_time += equips_speed;
    }
    return cast_time;
  }

}

(Parry as Mod).modify(ParryEquip);
