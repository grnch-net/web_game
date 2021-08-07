import type {
  InventoryObjectParameters,
  InventoryObject
} from '../../../inventories/index';

import type {
  SkillNeeds,
  SkillNeedsResult
} from '../../../skills/index';

import {
  Impact,
  TargetInteractResult
} from '../../../interactions/index';

import {
  EquipsController,
} from '../../../equips/index';

import {
  CharacterConfig,
  CharacterParameters,
  Character
} from '../../character';

type Mod = Modifiable<typeof Character>;

class CharacterEquip extends (Character as Mod).Latest {

  protected _initialize(
    parameters: CharacterParameters,
    config: CharacterConfig
  ) {
    super._initialize(parameters, config);
    const armorProtect = this.parameters.armorProtect || this.config.armorProtect;
    this.initialize_equipments(this.parameters.equips, armorProtect);
  }

  protected initialize_equipments(
    parameters: InventoryObjectParameters[],
    armorProtect: number
  ) {
    this.equips = new EquipsController;
    const impact = new Impact;
    this.equips.initialize(impact, parameters, armorProtect);
    this.apply_impact(impact);
    const list = this.equips.getAll();
    for (const item of list) {
      item.skill && this.add_outer_skill(item.skill);
      item.inventory && this.add_outer_inventory(item);
    }
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
  ): InventoryObject {
    super.get_inventory_item(inventoryIndex, itemIndex);
    return this.equips.getInventoryItem(inventoryIndex, itemIndex);
  }

  protected use_inventory_item(
    item: InventoryObject
  ): boolean {
    super.use_inventory_item(item);
    const is_ready = this.check_skill(item.skill);
    return is_ready && this.use_skill(item.skill);
  }

  protected get_skill_needs(
    needs: SkillNeeds
  ): SkillNeedsResult {
    const result = super.get_skill_needs(needs);
    result.equips = this.equips.getEquips(needs.equips);
    return result;
  }

  protected add_inventory_item(
    item: InventoryObject
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
    const removedItems: InventoryObject[] = [];
    const impact = new Impact;
    this.equips.equipInventoryItem(
      removedItems,
      impact,
      inventoryIndex,
      itemIndex,
      cell
    );
    this.apply_impact(impact);
    this.throwItems(removedItems);
  }

}

(Character as Mod).modify(CharacterEquip);
