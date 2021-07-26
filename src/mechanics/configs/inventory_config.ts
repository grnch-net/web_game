import type {
  InventoryObjectConfig
} from '../inventories/index';

import {
  SkillName
} from './skills_config';

import {
  EquipName
} from './equips_config';

type InventoryConfig = Associative<InventoryObjectConfig>;

enum InventoryItemName {
  ShortSword,
  SmallShield,
  WoodenStaff,
  IronHelmet,
  LeatherArmor,
  SmallBag,
  Bow,
  Arrow,
  ThrowingSpears,
  Pie
};

const inventoryConfig: InventoryConfig = {
  [InventoryItemName.ShortSword]: {
    name: 'Short sword',
    equip: EquipName.ShortSword,
  },
  [InventoryItemName.SmallShield]: {
    name: 'Small shield',
    equip: EquipName.SmallShield
  },
  [InventoryItemName.WoodenStaff]: {
    name: 'Wooden staff',
    equip: EquipName.WoodenStaff
  },
  [InventoryItemName.IronHelmet]: {
    name: 'Iron helmet',
    equip: EquipName.IronHelmet
  },
  [InventoryItemName.LeatherArmor]: {
    name: 'Leather armor',
    equip: EquipName.LeatherArmor
  },
  [InventoryItemName.SmallBag]: {
    name: 'Small bag',
    slots: 6,
    equip: EquipName.SmallBag
  },
  [InventoryItemName.Bow]: {
    name: 'Bow',
    equip: EquipName.Bow
  },
  [InventoryItemName.Arrow]: {
    name: 'Arrow',
    equip: EquipName.Arrow
  },
  [InventoryItemName.ThrowingSpears]: {
    name: 'Throwing spears',
    equip: EquipName.ThrowingSpears
  },
  [InventoryItemName.Pie]: {
    name: 'Pie',
    skill: SkillName.Eat
  }
}

export {
  InventoryConfig,
  InventoryItemName,
  inventoryConfig
}
