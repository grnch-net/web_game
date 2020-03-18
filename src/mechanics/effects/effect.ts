import {
  InteractionObject, InteractionParameters, Impact
} from '../interactions/index';

export interface EffectConfig extends InteractionParameters{
  name?: string;
  specialClass?: string;
  unique?: string;
  liveTime?: number;
}

export interface EffectParameters {
  id: string | number;
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
    super.initialize(config);
    this.config = config;
    this.parameters = parameters;
    this.active = false;
    this.ended = false;
    if (this.liveTime === undefined) {
      parameters.liveTime = config.liveTime || Infinity;
    }
  }

  added(
    innerImpact: any
  ) {
    if (this.active) return;
    this.active = true;
    for (const influence of this.inner_static_influences) {
      influence.apply(innerImpact);
    }
  }

  removed(
    innerImpact: any
  ) {
    if (!this.active) return;
    this.active = false;
    for (const influence of this.inner_static_influences) {
      influence.cancel(innerImpact);
    }
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
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
