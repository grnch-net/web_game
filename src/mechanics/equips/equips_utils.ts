import { Equip, EquipConfig, EquipParameters } from './equip';
import { equipsConfig } from '../configs/equips';

export class utils {
  protected constructor() {}

  static specialClassList: ({ [id: string]: typeof Equip }) = {};

  static findConfig(
    id: string | number
  ): EquipConfig {
    const config = equipsConfig[id];
    return config;
  }

  static findSpecialClass(
    specialId: string | number
  ): typeof Equip {
    const SpecialClass = utils.specialClassList[specialId];
    return SpecialClass;
  }

  static create(
    parameters: EquipParameters
  ): Equip {
    const config = utils.findConfig(parameters.id);
    if (!config) {
      console.error('Can not find equip config with id:', parameters.id);
      return null;
    }
    const { specialClass } = config;
    let EquipClass: typeof Equip;
    if (specialClass) {
      EquipClass = utils.findSpecialClass(specialClass);
      if (!EquipClass) {
        console.error('Can not find equip special class with id:', specialClass);
        return null;
      }
    } else {
      EquipClass = Equip;
    }
    const equip = new EquipClass();
    equip.initialize(config, parameters);
    return equip;
  }
}
