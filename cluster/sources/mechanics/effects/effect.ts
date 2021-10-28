import * as UTILS from '../../utils/index';

import {
  Impact,
  InteractionConfig,
  InteractionParameters,
  InteractionObject
} from '../interactions/index';

import {
  effectsConfig
} from '../configs/effects_config';

interface EffectConfig extends InteractionConfig {
  specialClass?: string;
  unique?: string;
  liveTime?: number;
}

interface EffectParameters extends InteractionParameters {
  id: string | number;
  liveTime?: number;
}

interface EffectCustomize {
  customs: Associative<typeof Effect>;
  configs: Associative<Effect>;

  AddCustomClass(
    id: string,
    custom: typeof Effect
  ): void;

  findConfig(
    id: string
  ): EffectConfig;

  findSpecialClass(
    specialId: string
  ): typeof Effect;

  create(
    parameters: EffectParameters,
    id?: string | number
  ): Effect;
}

type Customize = typeof InteractionObject & EffectCustomize;

@UTILS.customize(effectsConfig)
class Effect extends (InteractionObject as Customize) {

  active: boolean;
  ended: boolean;
  protected config: EffectConfig;
  protected parameters: EffectParameters;

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
