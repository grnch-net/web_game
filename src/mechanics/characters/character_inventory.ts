import type {
  Item
} from '../item/index';

import {
  Character
} from './character';

type Mod = Modifiable<typeof Character>;

class CharacterInventory extends (Character as Mod).Latest {

  protected track_inventory(
    item: Item
  ) {
    const list = item.inventory.getAll();
    for (const inventory_item of list) {
      this.track_inventory_item(inventory_item);
    }
  }

  protected track_inventory_item(
    item: Item
  ) {
    item.skill && this.track_skill(item.skill);
  }

}

(Character as Mod).modify(CharacterInventory, 'Inventory');

export type {
  CharacterInventory
};