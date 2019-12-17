import * as utils from './utils';
import { Influence, GradualInfluence, attributes } from './influences';

export class Controller extends utils.Collection {
  list: Effect[];

  add(effect: Effect, impact: any): boolean {
    const result = super.add(effect);
    effect.added(impact);
    return result;
  }

  remove(effect: Effect, impact: any): boolean {
    const result = super.remove(effect);
    result && effect.removed(impact);
    return result;
  }

  tick(dt: number, impact: any) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.tick(dt, impact);
      if (effect.ended) {
        this.remove(effect, impact);
      }
    });
  }

  onOuterImpact(impact: any) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.onOuterImpact(impact);
    });
  }

  onUseSkill(innerImpact: any, outerImpact: any) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.onUseSkill(innerImpact, outerImpact);
    });
  }
}

export abstract class Effect {
  active: boolean;
  ended: boolean;
  liveTimer: number;
  protected static_influences: Influence[];
  protected gradual_influences: GradualInfluence[];

  constructor(...options: any[]) {
    this.initialize(...options);
    this.initialize_influence(...options);
  }

  protected initialize(...options: any[]) {
    this.active = false;
    this.ended = false;
    this.liveTimer = Infinity;
    this.static_influences = [];
    this.gradual_influences = [];
  }

  protected initialize_influence(...options: any[]) {}

  tick(dt: number, impact: any) {
    if (dt < this.liveTimer) {
      this.liveTimer -= dt;
    } else {
      dt = this.liveTimer;
      this.liveTimer = 0;
      this.ended = true;
    }
    this.gradual_influences
    .forEach(influence => influence.tick(dt, impact));
  }

  added(impact: any) {
    this.active = true;
    this.static_influences.forEach(influence => influence.apply(impact));
  }

  removed(impact: any) {
    this.active = false;
    this.static_influences.forEach(influence => influence.cancel(impact));
  }

  protected add_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.static_influences.push(influence);
  }

  protected add_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.gradual_influences.push(influence);
  }

  onOuterImpact(impact: any) {}

  onUseSkill(innerImpact: any, outerImpact: any) {}
}

class HealthRegeneration extends Effect {
  constructor(value: number, time?: number) {
    super(value, time);
  }

  protected initialize(value: number, time?: number) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influence(value: number) {
    this.add_gradual_influence(attributes.healthValue, value);
  }
}

class StaminaRegeneration extends Effect {
  constructor(value: number, time?: number) {
    super(value, time);
  }

  protected initialize(value: number, time?: number) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influence(value: number) {
    this.add_gradual_influence(attributes.staminaValue, value);
  }
}

class WearinessRegeneration extends Effect {
  constructor(value: number, time?: number) {
    super(value, time);
  }

  protected initialize(value: number, time?: number) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_influence(value: number) {
    this.add_gradual_influence(attributes.wearinessValue, value);
  }
}

export const list: any = {
  HealthRegeneration,
  StaminaRegeneration,
  WearinessRegeneration
}
