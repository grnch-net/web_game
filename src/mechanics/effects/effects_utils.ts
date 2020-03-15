import { Effect, EffectParameters } from './effect';

type ClassList = { [id: string]: typeof Effect };

export class utils {
  protected constructor() {}

  static specialClassList: ClassList = {};

  static findSpecialClass(
    specialId: string | number
  ): typeof Effect {
    return utils.specialClassList[specialId];
  }

  static create(
    parameters: EffectParameters
  ): Effect {
    let EffectClass = Effect;
    if (parameters.specialClass) {
      EffectClass = utils.findSpecialClass(parameters.specialClass);;
      if (!EffectClass) {
        console.error(
          'Can not find skill special class with id:',
          parameters.specialClass
        );
        return null;
      }
    }
    const effect = new EffectClass();
    effect.initialize(parameters);
    return effect;
  }
}
