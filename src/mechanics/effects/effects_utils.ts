import { Effect, EffectConfig, EffectParameters } from './effect';
import { effectsConfig } from '../configs/effects';

type ClassList = { [id: string]: typeof Effect };

export class utils {
  protected constructor() {}

  static specialClassList: ClassList = {};

  static findConfig(
    id: string
  ): EffectConfig {
    return effectsConfig[id];
  }

  static findSpecialClass(
    specialId: string
  ): typeof Effect {
    return utils.specialClassList[specialId];
  }

  static create(
    parameters: EffectParameters,
    config?: EffectConfig
  ): Effect {
    config = config || utils.findConfig(parameters.id as string);

    let EffectClass = Effect;
    if (config.specialClass) {
      EffectClass = utils.findSpecialClass(config.specialClass);;
      if (!EffectClass) {
        console.error(
          'Can not find skill special class with id:',
          config.specialClass
        );
        return null;
      }
    }
    const effect = new EffectClass();
    effect.initialize(config, parameters);
    return effect;
  }
}
