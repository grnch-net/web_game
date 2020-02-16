import { Effect, EffectParameters } from './effect';

export default class utils {
  protected constructor() {}

  static specialClassList: ({ [id: string]: typeof Effect }) = {};

  static findSpecialClass(
    specialId: string | number
  ): typeof Effect {
    const SpecialClass = utils.specialClassList[specialId];
    return SpecialClass;
  }

  static create(
    parameters: EffectParameters
  ): Effect {
    const { specialClass } = parameters;
    let EffectClass: typeof Effect;
    if (specialClass) {
      EffectClass = utils.findSpecialClass(specialClass);;
      if (!EffectClass) {
        console.error('Can not find skill special class with id:', specialClass);
        return null;
      }
    } else {
      EffectClass = Effect;
    }
    const effect = new EffectClass();
    effect.initialize(parameters);
    return effect;
  }
}
