import {
  InteractionObject, InteractionConfig, InteractionParameters, Impact
} from '../interactions/index';

export interface EffectConfig extends InteractionConfig{
  name?: string;
  unique?: string;
  liveTime?: number;
}

export interface EffectParameters extends InteractionParameters {
  liveTime?: number;
}

export class Effect extends InteractionObject {
  active: boolean;
  ended: boolean;
  protected config: EffectConfig;
  protected parameters: EffectParameters;

  get name(): string {
    return this.config.name;
  }

  get unique(): string {
    return this.config.unique;
  }

  get liveTime(): number {
    return this.parameters.liveTime;
  }


  initialize(
    config: EffectConfig,
    parameters: EffectParameters
  ) {
    super.initialize(config, parameters);
    this.active = false;
    this.ended = false;
    if (this.liveTime === undefined) {
      parameters.liveTime = config.liveTime || Infinity;
    }
  }

  added(
    innerImpact: Impact
  ) {
    if (this.active) return;
    this.active = true;
    for (const influence of this.inner_static_influences) {
      influence.apply(innerImpact);
    }
  }

  removed(
    innerImpact: Impact
  ) {
    if (!this.active) return;
    this.active = false;
    for (const influence of this.inner_static_influences) {
      influence.cancel(innerImpact);
    }
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (dt < this.liveTime) {
      this.parameters.liveTime -= dt;
    } else {
      dt = this.liveTime;
      this.parameters.liveTime = 0;
      this.ended = true;
    }
    super.tick(dt, innerImpact, outerImpact);
  }

  onUseSkill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}
}
