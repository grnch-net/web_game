import {
  EquipSlot,
  EquipType,
  EquipConfig
} from '../equips/equip_types';


type EquipsConfig = {
  [id: string]: EquipConfig
};

const equipsConfig: EquipsConfig = {
  0: {
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
    slot: EquipSlot.SecondHand,
    type: EquipType.SecondHand,
    durability: { max: 30 },
    stats: {
      speed: 0.5,
      block: 15,
      armor: 25
    }
  },
  2: {
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
    slot: EquipSlot.Head,
    durability: { max: 10 },
    stats: {
      armor: 1
    }
  },
  4: {
    slot: EquipSlot.Body,
    durability: { max: 20 },
    stats: {
      armor: 1
    }
  },
  5: {
    slot: EquipSlot.Bag,
    durability: { max: 100 },
    stats: {
      slots: 1
    }
  }
}

export {
  EquipsConfig,
  equipsConfig
}
