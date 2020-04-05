import type {
  InventoryObjectConfig
} from '../inventory/index';

import {
  EquipSlot,
  EquipType
} from '../equips/equip_types';


type InventoryConfig = {
  [id: string]: InventoryObjectConfig
};

const inventoryConfig: InventoryConfig = {
  0: {
    name: 'Short sword',
    specialClass: 'equip',
    equip: {
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
  },
  1: {
    name: 'Small shield',
    specialClass: 'equip',
    equip: {
      slot: EquipSlot.SecondHand,
      type: EquipType.SecondHand,
      durability: { max: 30 },
      stats: {
        speed: 0.5,
        block: 15,
        armor: 25
      }
    }
  },
  2: {
    name: 'Wooden staf',
    specialClass: 'equip',
    equip: {
      slot: EquipSlot.MainHand,
      type: EquipType.TwoHand,
      durability: { max: 70 },
      stats: {
        speed: 1.5,
        penetration: 5,
        damage: 50,
        range: 2
      }
    }
  },
  3: {
    name: 'Iron helmet',
    specialClass: 'equip',
    equip: {
      slot: EquipSlot.Head,
      durability: { max: 10 },
      stats: {
        armor: 1
      }
    }
  },
  4: {
    name: 'Leather armor',
    specialClass: 'equip',
    equip: {
      slot: EquipSlot.Body,
      durability: { max: 20 },
      stats: {
        armor: 1
      }
    }
  },
  5: {
    name: 'Small bag',
    specialClass: 'equip',
    equip: {
      slot: EquipSlot.Bag,
      durability: { max: 100 },
      stats: {
        slots: 1
      }
    }
  },
  6: {
    name: 'Pie',
    usage: {
      count: 1,
      usageTime: 60,
      innerGradualInfluences: [
        {
          attribute: 'health',
          value: 2
        }
      ]
    },
  }
}

export {
  InventoryConfig,
  inventoryConfig
}
