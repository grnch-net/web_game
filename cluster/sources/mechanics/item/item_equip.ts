import {
  ItemConfig,
  ItemParameters,
  Item
} from './item';

import {
  EquipConfig,
  Equip
} from '../equips/index';

type Mod = Modifiable<typeof Item>;

class ItemEquip extends (Item as Mod).Latest {

  initialize(
    config: ItemConfig,
    parameters: ItemParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_equip(config.equip, parameters);
  }

  initialize_equip(
    config: string | number | EquipConfig,
    parameters: ItemParameters
  ) {
    if (config === undefined) return;
    if (!parameters.equip) parameters.equip = {};
    this.equip = Equip.create(parameters.equip, config);
  }

}

(Item as Mod).modify(ItemEquip);
