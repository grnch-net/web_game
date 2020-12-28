import {
  EquipSlot,
  EquipType,
  EquipSubType,
  EquipConfig
} from '../equips/equip_types';


type EquipsConfig = Associative<EquipConfig>;

const equipsConfig: EquipsConfig = {
  0: {
    name: 'Short sword',
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Sword,
    stats: {
      durability: 100,
      speed: 1,
      meleePenetration: 10,
      meleeDamage: 30,
      parry: 5,
      defense: 10
    }
  },
  1: {
    name: 'Small shield',
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Shield,
    stats: {
      durability: 30,
      speed: 0.5,
      block: 15,
      defense: 50
    }
  },
  2: {
    name: 'Wooden staff',
    slot: EquipSlot.Hold,
    type: EquipType.TwoHand,
    subType: EquipSubType.Polearm,
    stats: {
      durability: 70,
      speed: 1.5,
      meleePenetration: 5,
      meleeDamage: 50,
      parry: 10,
      defense: 25
    }
  },
  3: {
    name: 'Iron helmet',
    slot: EquipSlot.Head,
    stats: {
      durability: 10,
      armor: 1
    }
  },
  4: {
    name: 'Leather armor',
    slot: EquipSlot.Body,
    stats: {
      durability: 20,
      armor: 1
    }
  },
  5: {
    name: 'Small bag',
    slot: EquipSlot.Bag
  },
  6: {
    name: 'Bow',
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Bow,
    stats: {
      durability: 100,
      speed: 3,
      rangePenetration: 5,
      rangeDamage: 10,
      range: 10
    }
  },
  7: {
    name: 'Arrow',
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Arrow,
    stats: {
      rangePenetration: 5,
      rangeDamage: 20,
      range: 10
    }
  },
  8: {
    name: 'Throwing spears',
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Thrown,
    stats: {
      speed: 1.5,
      rangePenetration: 30,
      rangeDamage: 30,
      range: 10
    }
  }
}

export {
  EquipsConfig,
  equipsConfig
}
