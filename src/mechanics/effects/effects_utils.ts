import {
  EffectConfig,
  EffectParameters,
  Effect
} from './effect';

import {
  InteractionUtils
} from '../interactions/index';

import {
  effectsConfig
} from '../configs/effects_config';

class EffectUtils extends InteractionUtils {
  static BaseClass = Effect;
  static configs = effectsConfig;

  static findConfig(id: string): EffectConfig {
    return super.findConfig(id) as EffectConfig;
  }

  static findSpecialClass(specialId: string): typeof Effect {
    return super.findSpecialClass(specialId) as typeof Effect;
  }

  static create(
    parameters: EffectParameters,
    config?: EffectConfig
  ): Effect {
    return super.create(parameters, config) as Effect;
  }
}

export {
  EffectUtils
}
