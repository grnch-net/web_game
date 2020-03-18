import { Equip, EquipConfig, EquipParameters } from './equip';
import { equipsConfig } from '../configs/equips';

type ClassList = { [id: string]: typeof Equip };

export class utils {
  protected constructor() {}

  static specialClassList: ClassList = {};

  static findConfig(
    id: string
  ): EquipConfig {
    return equipsConfig[id];
  }

  static findSpecialClass(
    specialId: string
  ): typeof Equip {
    return utils.specialClassList[specialId];
  }

  static create(
    parameters: EquipParameters
  ): Equip {
    const config = utils.findConfig(parameters.id as string);
    if (!config) {
      console.error('Can not find equip config with id:', parameters.id);
      return null;
    }
    let EquipClass = Equip;
    if (config.specialClass) {
      EquipClass = utils.findSpecialClass(config.specialClass);
      if (!EquipClass) {
        console.error(
          'Can not find equip special class with id:',
          config.specialClass
        );
        return null;
      }
    }
    const equip = new EquipClass();
    equip.initialize(config, parameters);
    return equip;
  }
}
