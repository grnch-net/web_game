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
    stats: {
      durability: 100,
      speed: 1,
      penetration: 10,
      damage: 30,
      range: 1,
      parry: 5,
      defense: 10
    }
  },
  1: {
    slot: EquipSlot.SecondHand,
    type: EquipType.SecondHand,
    stats: {
      durability: 30,
      speed: 0.5,
      block: 15,
      defense: 25
    }
  },
  2: {
    slot: EquipSlot.MainHand,
    type: EquipType.TwoHand,
    stats: {
      durability: 70,
      speed: 1.5,
      penetration: 5,
      damage: 50,
      range: 2,
      parry: 10,
      defense: 25
    }
  },
  3: {
    slot: EquipSlot.Head,
    stats: {
      durability: 10,
      armor: 1
    }
  },
  4: {
    slot: EquipSlot.Body,
    stats: {
      durability: 20,
      armor: 1
    }
  },
  5: {
    slot: EquipSlot.Bag,
    stats: {
      slots: 1
    }
  }
}

export {
  EquipsConfig,
  equipsConfig
}
