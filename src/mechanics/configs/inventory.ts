import { InventoryObjectConfig } from '../inventory/index';
import { EquipConfig, EquipSlot, EquipType } from '../equips/index';

export type InventoryConfig = {
  [id: string]: InventoryObjectConfig | EquipConfig
};
export const inventoryConfig: InventoryConfig = {
  0: {
    name: 'Short sword',
    specialClass: 'equip',
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
    specialClass: 'equip',
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
    specialClass: 'equip',
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
    specialClass: 'equip',
    slot: EquipSlot.Head,
    durability: { max: 10 },
    stats: {
      armor: 1
    }
  },
  4: {
    name: 'Leather armor',
    specialClass: 'equip',
    slot: EquipSlot.Body,
    durability: { max: 20 },
    stats: {
      armor: 1
    }
  },
  5: {
    name: 'Small bag',
    specialClass: 'equip',
    slot: EquipSlot.Bag,
    durability: { max: 100 },
    stats: {
      slots: 1
    }
  },
  6: {
    name: 'Pie',
    usageTime: 60,
    innerGradualInfluences: [
      {
        attribute: 'health',
        value: 2
      }
    ]
  }
}
