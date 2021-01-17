import type {
  InventoryObject
} from '../../../inventories/index';

import {
  Character
} from '../../character';

type Mod = Modifiable<typeof Character>;

class CharacterInventory extends (Character as Mod).Latest {

  protected add_outer_inventory(
    item: InventoryObject
  ) {
    const list = item.inventory.getAll();
    for (const item of list) {
      item.skill && this.add_outer_skill(item.skill);
    }
  }

}

(Character as Mod).modify(CharacterInventory);
