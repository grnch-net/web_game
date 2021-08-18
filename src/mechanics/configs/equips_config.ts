import {
  EquipConfig
} from '../equips/equip_types';

type EquipsConfig = Associative<EquipConfig>;

enum EquipSlot {
  Hold,
  Head,
  Body,
  Bag
}

enum EquipSubType {
  Polearm,
  Sword,
  Shield,
  Bow,
  Arrow,
  Thrown
}

enum EquipName {
  Bag,
  ShortSword,
  SmallShield,
  WoodenStaff,
  IronHelmet,
  LeatherArmor,
  Bow,
  Arrow,
  ThrowingSpears
}

const equipsConfig: EquipsConfig = {
  [EquipName.Bag]: {
    slot: EquipSlot.Bag
  },
  [EquipName.ShortSword]: {
    slot: EquipSlot.Hold,
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
  [EquipName.SmallShield]: {
    slot: EquipSlot.Hold,
    subType: EquipSubType.Shield,
    stats: {
      durability: 30,
      speed: 0.5,
      block: 15,
      defense: 50
    }
  },
  [EquipName.WoodenStaff]: {
    slot: EquipSlot.Hold,
    size: 2,
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
  [EquipName.IronHelmet]: {
    slot: EquipSlot.Head,
    stats: {
      durability: 10,
      armor: 1
    }
  },
  [EquipName.LeatherArmor]: {
    slot: EquipSlot.Body,
    stats: {
      durability: 20,
      armor: 1
    }
  },
  [EquipName.Bow]: {
    slot: EquipSlot.Hold,
    subType: EquipSubType.Bow,
    stats: {
      durability: 100,
      speed: 3,
      rangePenetration: 5,
      rangeDamage: 10,
      range: 10
    }
  },
  [EquipName.Arrow]: {
    slot: EquipSlot.Hold,
    subType: EquipSubType.Arrow,
    stats: {
      rangePenetration: 5,
      rangeDamage: 20,
      range: 10
    }
  },
  [EquipName.ThrowingSpears]: {
    slot: EquipSlot.Hold,
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
  EquipSlot,
  EquipSubType,
  EquipName,
  equipsConfig
}
