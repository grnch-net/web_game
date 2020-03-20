import { InteractionUtils } from '../interactions/index';
import { Effect, EffectConfig, EffectParameters } from './effect';
import { effectsConfig, EffectsConfig } from '../configs/effects';
import { specialClassList } from './specials/index';

type ClassList = { [id: string]: typeof Effect };

export class effectUtils extends InteractionUtils {
  static BaseClass: typeof Effect = Effect;
  static configs: EffectsConfig = effectsConfig;
  static specialClassList: ClassList = specialClassList;

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
