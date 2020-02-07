import { Skill } from '../skill';
import { attributes } from '../../influences';
import { Equip } from '../../equips/index';

export default class Block extends Skill {
  protected _equip: Equip

  checkNeeds(
    result: ({ equip: Equip })
  ): boolean {
    this._equip = result.equip;
    return true;
  }

  onOuterImpact(
    impact: any
  ) {
    super.onOuterImpact(impact);
    if (!this.usageTime) return;
    if (!impact[attributes.health]) return;
    if (impact[attributes.health] < 0) {
      if (this._equip && this._equip.stats.block) {
        delete impact[attributes.health];
      }
      for (const influence of this.stock) {
        influence.apply(impact);
      }
      this.usageTime = 0;
    }
  }
}
