import {
  test_use_item
} from './use';

import {
  test_equip_item
} from './equip';

function test_inventory_items() {
  console.group('Inventory Items');
  test_use_item();
  test_equip_item();
  console.groupEnd();
}

export {
  test_inventory_items
}
