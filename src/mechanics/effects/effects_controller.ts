import { Effect, EffectParameters } from './effect';
import { effectUtils } from './effects_utils';
import { Impact } from '../interactions/index';

type ClassList = { [id: string]: Effect };

export class EffectsController {
  list: Effect[];
  protected unique_list: ClassList;

  initialize(
    list: EffectParameters[],
    innerImpact: Impact
  ) {
    this.list = [];
    for (const parameters of list) {
      const effect = effectUtils.create(parameters);
      this.add(effect, innerImpact);
    }
  }

  add(
    effect: Effect,
    innerImpact: Impact,
    outerImpact?: Impact
  ): boolean {
    if (effect.unique) {
      this.add_unique(effect, innerImpact, outerImpact);
    }
    effect.added(innerImpact);
    if (this.list.includes(effect)) {
      return false;
    }
    this.list.push(effect);
    return true;
  }

  protected add_unique(
    effect: Effect,
    innerImpact: Impact,
    outerImpact?: Impact
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
    innerImpact: Impact,
    outerImpact?: Impact
  ): boolean {
    if (!this.list.includes(effect)) {
      return false;
    }
    if (effect.unique) {
      delete this.unique_list[effect.unique];
    }
    effect.removed(innerImpact);
    const index = this.list.indexOf(effect);
    this.list.splice(index, 1);
    return true;
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    for (const effect of this.list) {
      if (!effect.active) continue;
      effect.tick(dt, innerImpact, outerImpact);
      if (effect.ended) {
        this.remove(effect, innerImpact, outerImpact);
      }
    }
  }

  onOuterImpact(
    impact: Impact
  ) {
    for (const effect of this.list) {
      if (!effect.active) continue;
      effect.onOuterImpact(impact);
    };
  }

  onUseSkill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    for (const effect of this.list) {
      if (!effect.active) continue;
      effect.onUseSkill(innerImpact, outerImpact);
    };
  }
}
