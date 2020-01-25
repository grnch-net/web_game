import * as utils from './utils';
import ImpactObject from './impact_object';
import { Influence, GradualInfluence, attributes } from './influences';

export class Controller extends utils.Collection {
  list: Effect[];

  add(
    effect: Effect,
    impact: any
  ): boolean {
    const result = super.add(effect);
    effect.added(impact);
    return result;
  }

  remove(
    effect: Effect,
    innerImpact: any,
    outerImpact: any
  ): boolean {
    const result = super.remove(effect);
    result && effect.removed(innerImpact, outerImpact);
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

export abstract class Effect extends ImpactObject {
  active: boolean;
  ended: boolean;
  liveTimer: number;

  protected initialize(
    ...options: any[]
  ) {
    super.initialize();
    this.active = false;
    this.ended = false;
    this.liveTimer = Infinity;
  }

  added(
    innerImpact: any
  ) {
    this.active = true;
    this.inner_static_influences.forEach(influence => influence.apply(innerImpact));
  }

  removed(
    innerImpact: any,
    outerImpact: any
  ) {
    this.active = false;
    this.inner_static_influences
    .forEach(influence => influence.cancel(innerImpact));
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ) {
    if (dt < this.liveTimer) {
      this.liveTimer -= dt;
    } else {
      dt = this.liveTimer;
      this.liveTimer = 0;
      this.ended = true;
    }
    this.tick_influences(dt, innerImpact, outerImpact);
  }

}

class HealthRegeneration extends Effect {
  constructor(
    value: number,
    time?: number
  ) {
    super(value, time);
  }

  protected initialize(
    value: number,
    time?: number
  ) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influences(
    value: number
  ) {
    super.initialize_influences();
    this.add_inner_gradual_influence(attributes.health, value);
  }
}

class StaminaRegeneration extends Effect {
  constructor(
    value: number,
    time?: number
  ) {
    super(value, time);
  }

  protected initialize(
    value: number,
    time?: number
  ) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influences(
    value: number
  ) {
    super.initialize_influences();
    this.add_inner_gradual_influence(attributes.stamina, value);
  }
}

class WearinessRegeneration extends Effect {
  constructor(
    value: number,
    time?: number
  ) {
    super(value, time);
  }

  protected initialize(
    value: number,
    time?: number
  ) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influences(
    value: number
  ) {
    super.initialize_influences();
    this.add_inner_gradual_influence(attributes.weariness, value);
  }
}

export const list: any = {
  HealthRegeneration,
  StaminaRegeneration,
  WearinessRegeneration
}
