import { Collection } from '../utils';
import { Effect } from './effect';

export class Controller extends Collection {
  list: Effect[];
  protected unique_list: ({ [id: string]: Effect });

  add(
    effect: Effect,
    innerImpact: any,
    outerImpact?: any
  ): boolean {
    if (effect.unique) {
      this.add_unique(effect, innerImpact, outerImpact);
    }
    const result = super.add(effect);
    effect.added(innerImpact);
    return result;
  }

  protected add_unique(
    effect: Effect,
    innerImpact: any,
    outerImpact?: any
  ) {
    const id = effect.unique;
    const last_effect = this.unique_list[id];
    if (last_effect) {
      this.remove(last_effect, innerImpact, outerImpact);
    }
    this.unique_list[id] = effect;
  }

  remove(
    effect: Effect,
    innerImpact: any,
    outerImpact?: any
  ): boolean {
    if (effect.unique) {
      delete this.unique_list[effect.unique];
    }
    const result = super.remove(effect);
    result && effect.removed(innerImpact);
    return result;
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.tick(dt, innerImpact, outerImpact);
      if (effect.ended) {
        this.remove(effect, innerImpact, outerImpact);
      }
    });
  }

  onOuterImpact(
    impact: any
  ) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.onOuterImpact(impact);
    });
  }

  onUseSkill(
    innerImpact: any,
    outerImpact: any
  ) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.onUseSkill(innerImpact, outerImpact);
    });
  }
}
