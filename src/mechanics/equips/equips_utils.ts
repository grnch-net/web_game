import { InteractionUtils } from '../interactions/index';
import { Equip, EquipConfig, EquipParameters } from './equip';
import { equipsConfig, EquipsConfig } from '../configs/equips';
import { specialClassList } from './specials/index';

type ClassList = { [id: string]: typeof Equip };

export class equipUtils extends InteractionUtils {
  static BaseClass: typeof Equip = Equip;
  static configs: EquipsConfig = equipsConfig;
  static specialClassList: ClassList = specialClassList;

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
    config?: EquipConfig
  ): Equip {
    return super.create(parameters, config) as Equip;
  }
}
