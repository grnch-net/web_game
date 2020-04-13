import {
  Impact,
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

interface EffectConfig extends InteractionConfig {
  unique?: string;
  liveTime?: number;
}

interface EffectParameters extends InteractionParameters {
  id: string | number;
  liveTime?: number;
}

class Effect extends InteractionObject {
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
    this.inner_static_influence.apply(innerImpact.influenced);
  }

  removed(
    innerImpact: Impact
  ) {
    if (!this.active) return;
    this.active = false;
    this.inner_static_influence.cancel(innerImpact.influenced);
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

export {
  EffectConfig,
  EffectParameters,
  Effect
}
