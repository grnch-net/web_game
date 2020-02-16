import { Equip, EquipConfig, EquipParameters, EquipType } from './equip';

export default class utils {
  protected constructor() {}

  static configs: ({[id: string]: EquipConfig}) = {
    0: {
      name: 'Short sword',
      type: EquipType.OneHand,
      durability: { max: 100 },
      stats: {
        speed: 1,
        penetration: 10,
        damage: 30,
        range: 1
      }
    },
    1: {
      name: 'Small shield',
      type: EquipType.SecondHand,
      durability: { max: 30 },
      stats: {
        speed: 0.5,
        block: 10,
        armor: 25
      }
    },
    2: {
      name: 'Wooden staf',
      type: EquipType.TwoHand,
      durability: { max: 70 },
      stats: {
        speed: 1.5,
        penetration: 5,
        damage: 50,
        range: 2
      }
    },
    3: {
      name: 'Iron helmet',
      type: EquipType.Head,
      durability: { max: 10 },
      stats: {
        armor: 1
      }
    },
    4: {
      name: 'Leather armor',
      type: EquipType.Body,
      durability: { max: 20 },
      stats: {
        armor: 1
      }
    },
    5: {
      name: 'Small bag',
      type: EquipType.Bag,
      durability: { max: 100 },
      stats: {
        slots: 1
      }
    }
  };

  static specialClassList: ({ [id: string]: typeof Equip }) = {};

  static findConfig(
    id: string | number
  ): EquipConfig {
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
