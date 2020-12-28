import type {
  InventoryObjectConfig
} from '../inventories/index';

type InventoryConfig = Associative<InventoryObjectConfig>;

const inventoryConfig: InventoryConfig = {
  0: {
    name: 'Short sword',
    equip: 0,
  },
  1: {
    name: 'Small shield',
    equip: 1
  },
  2: {
    name: 'Wooden staff',
    equip: 2
  },
  3: {
    name: 'Iron helmet',
    equip: 3
  },
  4: {
    name: 'Leather armor',
    equip: 4
  },
  5: {
    name: 'Small bag',
    slots: 6,
    equip: 5
  },
  6: {
    name: 'Pie',
    skill: 3
  },
  7: {
    name: 'Bow',
    equip: 6
  },
  8: {
    name: 'Arrow',
    equip: 7
  },
  9: {
    name: 'Throwing spears',
    equip: 8
  }
}

export {
  InventoryConfig,
  inventoryConfig
}
