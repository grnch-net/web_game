import type {
  Item
} from '../item/index';

import {
  Impact,
  TargetInteractResult
} from '../interactions/index';

import {
  EquipsController,
} from '../equips/index';

import {
  CharacterConfig,
  CharacterParameters,
  Character
} from './character';

type Mod = Modifiable<typeof Character>;

function CharacterEquip_ModCall(Latest: typeof Character) {
  class CharacterEquip extends Latest {

    protected _initialize(
      parameters: CharacterParameters,
      config: CharacterConfig
    ) {
      super._initialize(parameters, config);
      this.initialize_equipments();
    }
  
    protected initialize_equipments() {
      this.equips = new EquipsController;
      const impact = new Impact;
      const { slots } = this.config;
      const { equips } = this.parameters;

      this.equips.initialize(impact, equips, slots);

      this.apply_impact(impact);
      const list = this.equips.getAll();
      for (const item of list) {
        this.track_equip(item);
      }
    }

    protected track_equip(
      item: Item
    ) {
      item.skill && this.track_skill(item.skill);
      item.inventory && this.track_inventory(item);
    }
  
    protected interact_listeners(
      innerImpact: Impact,
      interactResult: TargetInteractResult
    ) {
      super.interact_listeners(innerImpact, interactResult);
      this.equips.onOuterImpact(innerImpact, interactResult);
    }
  
    protected get_inventory_item(
      inventoryIndex: number,
      itemIndex: number
    ): Item {
      super.get_inventory_item(inventoryIndex, itemIndex);
      return this.equips.getInventoryItem(inventoryIndex, itemIndex);
    }
  
    protected use_inventory_item(
      item: Item
    ): boolean {
      super.use_inventory_item(item);
      const is_ready = this.check_skill(item.skill);
      return is_ready && this.use_skill(item.skill);
    }
  
    protected add_inventory_item(
      item: Item
    ): boolean {
      super.add_inventory_item(item);
      return this.equips.addToInventory(item);
    }
  
    equipInventoryItem(
      inventoryIndex: number,
      itemIndex: number,
      cell?: number
    ) {
      super.equipInventoryItem(inventoryIndex, itemIndex, cell);
      const removedItems: Item[] = [];
      const impact = new Impact;
      this.equips.equipInventoryItem(
        removedItems,
        impact,
        inventoryIndex,
        itemIndex
      );
      this.apply_impact(impact);
      this.throwItems(removedItems);
    }

  }

  return CharacterEquip;
}

(Character as Mod).modifyAfter('Inventory', CharacterEquip_ModCall, 'Equip');
