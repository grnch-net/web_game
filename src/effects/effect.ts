import {
  InteractionObject, InteractionParameters, Impact
} from '../interactions/index';

export interface EffectParameters extends InteractionParameters{
  name?: string;
  specialClass?: string | number;
  unique?: string;
  time?: number;
}

export class Effect extends InteractionObject {
  name: string;
  unique: string;
  active: boolean;
  ended: boolean;
  liveTimer: number;

  initialize(
    parameters: EffectParameters
  ) {
    super.initialize(parameters);
    this.name = parameters.name;
    this.active = false;
    this.ended = false;
    this.liveTimer = parameters.time || Infinity;
    if (parameters.unique) {
      this.unique = parameters.unique;
    }
  }

  added(
    innerImpact: any
  ) {
    if (!this.active) {
      for (const influence of this.inner_static_influences) {
        influence.apply(innerImpact);
      }
    }
    this.active = true;
  }

  removed(
    innerImpact: any
  ) {
    if (this.active) {
      for (const influence of this.inner_static_influences) {
        influence.cancel(innerImpact);
      }
    }
    this.active = false;
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
    super.tick(dt, innerImpact, outerImpact);
  }

  onUseSkill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}
}
