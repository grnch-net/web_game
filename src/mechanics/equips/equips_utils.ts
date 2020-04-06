import {
  EquipConfig,
  EquipParameters,
  Equip
} from './equip';

import {
  equipsConfig
} from '../configs/equips_config';

import {
  InteractionUtils
} from '../interactions/index';

class EquipsUtils extends InteractionUtils {
  static BaseClass = Equip;
  static configs = equipsConfig;

  static findConfig(
    id: string
  ): EquipConfig {
    return super.findConfig(id) as EquipConfig;
  }

  static findSpecialClass(
    specialId: string
  ): typeof Equip {
    return super.findSpecialClass(specialId) as typeof Equip;
  }

  static create(
    parameters: EquipParameters,
    id: string | number
  ): Equip {
    return super.create(parameters, id) as Equip;
  }
}

export {
  EquipsUtils
}
