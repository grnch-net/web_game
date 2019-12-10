import * as utils from './utils';
import { Influence, GradualInfluence, attributes } from './influences';

export class Controller extends utils.Collection {
  list: Effect[];

  add(effect: Effect): boolean {
    const result = super.add(effect);
    effect.added();
    return result;
  }

  remove(effect: Effect): boolean {
    const result = super.remove(effect);
    result && effect.removed();
    return result;
  }

  tick(dt: number, impact: any) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.tick(dt, impact);
      if (effect.ended) {
        this.remove(effect);
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
  staticInfluences: Influence[];
  gradualInfluences: GradualInfluence[];

  constructor(...options: any[]) {
    this.initialize(...options);
    this.initialize_influence(...options);
  }

  protected initialize(...options: any[]) {
    this.active = false;
    this.ended = false;
    this.liveTimer = Infinity;
    this.staticInfluences = [];
    this.gradualInfluences = [];
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
    this.gradualInfluences
    .forEach(influence => {
      influence.tick(dt);
      const { attribute, deltaValue } = influence;
      impact[attribute] = impact[attribute] || 0;
      impact[attribute] += deltaValue;
    });
  }

  added() {
    this.active = true;
  }

  removed() {
    this.active = false;
  }

  protected add_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.staticInfluences.push(influence);
  }

  protected add_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.gradualInfluences.push(influence);
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
