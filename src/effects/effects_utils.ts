import { Effect, iParameters } from './effect';

export default class utils {
  protected constructor() {}

  static specialClassList: any = {};

  static findSpecialClass(
    specialId: string | number
  ): any {
    const SpecialClass = utils.specialClassList[specialId];
    return SpecialClass;
  }

  static create(
    parameters: iParameters
  ): Effect {
    const { specialClass } = parameters;
    let SkillClass: any;
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
