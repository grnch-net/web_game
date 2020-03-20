import { EquipConfig, EquipSlot, EquipType } from '../equips/index';

export type EquipsConfig = { [id: string]: EquipConfig };
export const equipsConfig: EquipsConfig = {
  0: {
    name: 'Short sword',
    slot: [EquipSlot.MainHand, EquipSlot.SecondHand],
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
    slot: EquipSlot.SecondHand,
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
    slot: EquipSlot.MainHand,
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
    slot: EquipSlot.Head,
    durability: { max: 10 },
    stats: {
      armor: 1
    }
  },
  4: {
    name: 'Leather armor',
    slot: EquipSlot.Body,
    durability: { max: 20 },
    stats: {
      armor: 1
    }
  },
  5: {
    name: 'Small bag',
    slot: EquipSlot.Bag,
    durability: { max: 100 },
    stats: {
      slots: 1
    }
  }
};
