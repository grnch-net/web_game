import { Equip, iConfig, iParameters, equipType } from './equip';

export default class utils {
  protected constructor() {}

  static configs: ({[id: string]: iConfig}) = {
    0: {
      name: 'Short sword',
      type: equipType.oneHand,
      durability: { max: 100 },
      stats: {
        damage: 1
      }
    },
    1: {
      name: 'Small shield',
      type: equipType.secondHand,
      durability: { max: 30 },
      stats: {
        block: 0.3
      }
    },
    2: {
      name: 'Wooden staf',
      type: equipType.twoHand,
      durability: { max: 70 },
      stats: {
        damage: 1
      }
    },
    3: {
      name: 'Iron helmet',
      type: equipType.head,
      durability: { max: 10 },
      stats: {
        armor: 1
      }
    },
    4: {
      name: 'Leather armor',
      type: equipType.body,
      durability: { max: 20 },
      stats: {
        armor: 1
      }
    },
    5: {
      name: 'Small bag',
      type: equipType.bag,
      durability: { max: 100 },
      stats: {
        slots: 1
      }
    }
  };

  static specialClassList: ({ [id: string]: typeof Equip }) = {};

  static findConfig(
    id: string | number
  ): iConfig {
    const config = utils.configs[id];
    return config;
  }

  static findSpecialClass(
    specialId: string | number
  ): typeof Equip {
    const SpecialClass = utils.specialClassList[specialId];
    return SpecialClass;
  }

  static create(
    parameters: iParameters
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
    const equip = new EquipClass(config, parameters);
    return equip;
  }
}
