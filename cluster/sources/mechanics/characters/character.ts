import type {
  EffectsController,
  EffectParameters
} from '../effects/index';

import type {
  Skill,
  SkillParameters,
  SkillsController,
  SkillNeeds,
  SkillNeedsResult
} from '../skills/index';

import type {
  EquipsController,
} from '../equips/index';

import type {
  ItemParameters,
  Item
} from '../item/index';

import {
  WorldObjectParameters,
  WorldObject
} from '../world_object';

import {
  Impact,
  Attribute,
  InfluenceList,
  TargetInteractResult,
  InteractResult
} from '../interactions/index';

import {
  characterConfig
} from '../configs/character_config';

type Attributes = { [key: string]: RangeNumber };
// type Counters = { [key: string]: number };

interface CharacterConfig {
  moveForce?: number;
  slots: {
    [key: string]: number
  };
  attributes: Attributes;
  // counters: Counters;
  effects: EffectParameters[];
  skills: SkillParameters[];
  equips: ItemParameters[];
}

interface CharacterParameters extends CharacterConfig, WorldObjectParameters {
  name: string;
}

@UTILS.modifiable
class Character extends WorldObject {

  // TODO: move attributes to modifications
  static createParameters(
    name: string,
    config = characterConfig
  ): CharacterParameters {
    return {
      name,
      moveForce: config.moveForce,
      rotation: 0,
      position: { x: 0, y: 0, z: 0 },
      attributes: {
        health: {
          value: config.attributes.health.max
        },
        stamina: {
          value: config.attributes.stamina.max
        }
      },
      // counters: {},
      effects: [],
      skills: [],
      equips: [],
      slots: {}
    }
  }

  attributes: Attributes;
  effects: EffectsController;
  skills: SkillsController;
  equips: EquipsController;
  protected parameters: CharacterParameters;
  protected config: CharacterConfig;

  get name(): string {
    return this.parameters.name;
  }

  // get counters(): Counters {
  //   return this.parameters.counters;
  // }

  protected _initialize(
    parameters: CharacterParameters,
    config?: CharacterConfig
  ) {
    super._initialize(parameters);
    this.config = config || characterConfig;
    this.initialize_attributes(this.parameters.attributes, this.config.attributes);
    // this.initialize_counters(this.parameters.counters, this.config.counters);
  }

  protected initialize_attributes(
    parameters: Attributes,
    config: Attributes
  ) {
    this.attributes = {};
    for (let key in config) {
      parameters[key] = parameters[key] || {};
      this.attributes[key] = new UTILS.Range(config[key], parameters[key]);
    }
  }

  // protected initialize_counters(
  //   parameters: Counters,
  //   config: Counters
  // ) {
  //   parameters = { ...config, ...parameters };
  // }

  tick(
    dt: number
  ): number {
    dt = super.tick(dt);
    if (!dt) {
      return 0;
    }
    const innerImpact = new Impact;
    const outerImpact = new Impact;
    this.tick_listeners(dt, innerImpact, outerImpact);
    this.apply_impact(innerImpact);
    this.apply_interaction(outerImpact);
    return dt;
  }

  protected tick_listeners(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {}

  protected apply_impact(
    innerImpact: Impact
  ) {
    this.apply_influence(innerImpact.influenced);
  }

  protected apply_influence(
    influenced: InfluenceList
  ) {
    let key: Attribute;
    for (key in influenced) {
      this.attributes[key].value += influenced[key];
    }
  }

  interact(
    innerImpact: Impact
  ): TargetInteractResult {
    this.tick(0);
    const result: TargetInteractResult = { hit: true };
    this.interact_listeners(innerImpact, result);
    this.apply_impact(innerImpact);
    return result;
  }

  protected interact_listeners(
    innerImpact: Impact,
    interactResult: TargetInteractResult
  ) {}

  useInventoryItem(
    inventoryIndex: number,
    itemIndex: number
  ): boolean {
    const item = this.get_inventory_item(inventoryIndex, itemIndex);
    return !!item && this.use_inventory_item(item);
  }

  protected get_inventory_item(
    inventoryIndex: number,
    itemIndex: number
  ): Item {
    return null;
  }

  protected use_inventory_item(
    item: Item
  ): boolean {
    return false;
  }

  protected check_skill(
    skill: Skill
  ): boolean {
    return !!skill;
  }

  useSkill(
    id: string | number
  ): boolean {
    this.tick(0);
    const skill = this.get_skill(id);
    return !!skill && this.use_skill(skill);
  }

  protected get_skill(
    id: string | number
  ): Skill {
    return null;
  }

  protected use_skill(
    skill: Skill
  ): boolean {
    return false;
  }

  protected get_skill_needs(
    needs: SkillNeeds
  ): SkillNeedsResult {
    return {}
  }

  protected skill_listeners(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}

  protected check_impact(
    influenced: InfluenceList
  ): boolean {
    let key: Attribute;
    for (key in influenced) {
      const inner_value = influenced[key];
      const current_value = this.attributes[key].value;
      const result = current_value + inner_value;
      if (result < 0) {
        return false;
      }
    }
    return true;
  }

  protected apply_cost(
    influenced: InfluenceList
  ) {
    const checked = this.check_impact(influenced);
    if (!checked) return false;
    this.apply_influence(influenced);
    return true;
  }

  protected apply_interaction(
    impact: Impact,
  ) {
    this.world.action(this, impact);
  }

  interactResult(
    results: InteractResult
  ) {
    this.interact_result_listeners(results);
  }

  protected interact_result_listeners(
    results: InteractResult
  ) {}

  addInventoryItem(
    item: Item
  ): boolean {
    return this.add_inventory_item(item);
  }

  protected add_inventory_item(
    item: Item
  ): boolean {
    return false;
  }

  equipInventoryItem(
    inventoryIndex: number,
    itemIndex: number,
    cell?: number
  ) {}

  throwItems(
    items: Item | Item[]
  ) {
    // const container = this.world.getItemsContainer(this);
    // container.add(items);
  }






  protected track_inventory(
    item: Item
  ) {
    // Inventory Mod
  }

  protected track_skill(
    skill: Skill
  ) {
    // Skill Mod
  }

}

export {
  CharacterConfig,
  CharacterParameters,
  Character
};
