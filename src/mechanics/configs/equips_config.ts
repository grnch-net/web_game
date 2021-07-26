import {
  EquipSlot,
  EquipType,
  EquipSubType,
  EquipConfig
} from '../equips/equip_types';

type EquipsConfig = Associative<EquipConfig>;

enum EquipName {
  ShortSword,
  SmallShield,
  WoodenStaff,
  IronHelmet,
  LeatherArmor,
  SmallBag,
  Bow,
  Arrow,
  ThrowingSpears
};

const equipsConfig: EquipsConfig = {
  [EquipName.ShortSword]: {
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
  [EquipName.SmallShield]: {
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
  [EquipName.WoodenStaff]: {
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
  [EquipName.SmallBag]: {
    slot: EquipSlot.Bag
  },
  [EquipName.Bow]: {
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
  [EquipName.Arrow]: {
    slot: EquipSlot.Hold,
    type: EquipType.OneHand,
    subType: EquipSubType.Arrow,
    stats: {
      rangePenetration: 5,
      rangeDamage: 20,
      range: 10
    }
  },
  [EquipName.ThrowingSpears]: {
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
  EquipName,
  equipsConfig
}
