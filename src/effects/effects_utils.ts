import { Effect, iParameters } from './effect';

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
    parameters: iParameters
  ): Effect {
    const { specialClass } = parameters;
    let SkillClass: typeof Effect;
    if (specialClass) {
      SkillClass = utils.findSpecialClass(specialClass);;
      if (!SkillClass) {
        console.error('Can not find skill special class with id:', specialClass);
        return null;
      }
    } else {
      SkillClass = Effect;
    }
    const equip = new SkillClass(parameters);
    return equip;
  }
}
