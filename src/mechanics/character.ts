import {
  WorldObject
} from './world_object';

import {
  Impact,
  Attribute,
  InfluenceList,
  InteractResult
} from './interactions/index';

import {
  Range,
  RangeParameters
} from './utils';

import {
  EffectsController,
  EffectParameters
} from './effects/index';

import {
  EquipsController,
} from './equips/index';

import {
  InventoryObjectParameters,
} from './inventory/index';

import {
  Skill,
  SkillParameters,
  SkillsController
} from './skills/index';

import {
  characterConfig
} from './configs/character_default_config';

type Attributes = { [key in Attribute]?: RangeParameters };
type Counters = { [key: string]: number };
type AttributesRange = { [key in Attribute]?: Range };

export interface CharacterConfig {
  attributes: Attributes;
  counters: Counters;
  effects: EffectParameters[];
  skills: SkillParameters[];
  equips: InventoryObjectParameters[];
  inventory: InventoryObjectParameters[];
  armorProtect?: number;
}

export interface CharacterParameters extends CharacterConfig {
  name: string;
}

export class Character extends WorldObject {
  attributes: AttributesRange;
  effects: EffectsController;
  skills: SkillsController;
  equips: EquipsController;
  protected parameters: CharacterParameters;
  protected config: CharacterConfig;

  get name(): string {
    return this.parameters.name;
  }

  get counters(): Counters {
    return this.parameters.counters;
  }

  initialize(
    parameters: CharacterParameters,
    config: CharacterConfig = characterConfig
  ) {
    super.initialize();
    this.parameters = parameters;
    this.config = config;
    this.initialize_attributes(parameters.attributes, config.attributes);
    this.initialize_counters(parameters.counters, config.counters);
    this.initialize_effects(parameters.effects, config.effects);
    this.initialize_skills(parameters.skills, config.skills);
    const armorProtect = parameters.armorProtect || config.armorProtect;
    this.initialize_equipments(parameters.equips, config.equips, armorProtect);
  }

  protected initialize_attributes(
    parameters: Attributes,
    config: Attributes
  ) {
    this.attributes = {};
    let key: Attribute;
    for (key in config) {
      parameters[key] = parameters[key] || {};
      this.attributes[key] = new Range(config[key], parameters[key]);
    }
  }

  protected initialize_counters(
    parameters: Counters,
    config: Counters
  ) {
    parameters = { ...config, ...parameters };
  }

  protected initialize_effects(
    parameters: EffectParameters[],
    config: EffectParameters[]
  ) {
    this.effects = new EffectsController;
    const impact = new Impact;
    const list = [...config, ...parameters];
    this.effects.initialize(list, impact);
    this.apply_impact(impact);
  }

  protected initialize_skills(
    parameters: SkillParameters[],
    config: SkillParameters[]
  ) {
    this.skills = new SkillsController;
    const list = [...config, ...parameters];
    this.skills.initialize(list);
  }

  protected initialize_equipments(
    parameters: InventoryObjectParameters[],
    config: InventoryObjectParameters[],
    armorProtect: number
  ) {
    this.equips = new EquipsController;
    const impact = new Impact;
    // const list = [...config, ...parameters];
    this.equips.initialize(impact, parameters, armorProtect);
    this.apply_impact(impact);
  }

  tick(
    dt: number,
    innerImpact: Impact
  ) {
    const outerImpact = new Impact;
    this.tick_skills(dt, innerImpact, outerImpact);
    this.effects.tick(dt, innerImpact, outerImpact);
    this.apply_impact(innerImpact);
    this.apply_interaction(outerImpact);
  }

  protected tick_skills(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.skills.tick(dt, innerImpact, outerImpact);
    const skill = this.skills.using;
    if (skill && !skill.castTime) {
      const costImpact = skill.getGradualCostImpact();
      if (costImpact) {
        const paid = this.apply_cost(costImpact);
        if (!paid) this.skills.cancelUse();
      }
    }
  }

  protected apply_impact(
    innerImpact: Impact
  ) {
    // for (const effect of innerImpact.effects) {
    //   this.effects.add(effect, innerImpact);
    // }
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
  ): InteractResult {
    const result: InteractResult = {};
    result.hit = true;
    this.effects.onOuterImpact(innerImpact, result);
    this.skills.onOuterImpact(innerImpact, result);
    this.equips.onOuterImpact(innerImpact, result);
    this.apply_impact(innerImpact);
    return result;
  }

  useSkill(
    id: string | number
  ): boolean {
    const skill = this.skills.getToUse(id as string);
    if (!skill) return false;
    const checked = this.check_skill(skill);
    if (!checked) return false;
    const innerImpact = new Impact;
    const outerImpact = new Impact;
    this.skills.use(skill, innerImpact, outerImpact);
    this.apply_skill(innerImpact, outerImpact);
    this.apply_impact(innerImpact);
    this.apply_interaction(outerImpact);
    return true;
  }

  protected check_skill(
    skill: Skill
  ) {
    if (skill.needs) {
      const checked = skill.checkNeeds({
        equips: this.equips.getEquips(skill.needs.equips)
      });
      if (!checked) return false;
    }
    const stockImpact = skill.getStockImpact();
    if (stockImpact) {
      const stocked = this.check_impact(stockImpact);
      if (!stocked) return false;
    }
    const costImpact = skill.getCostImpact();
    if (costImpact) {
      const paid = this.apply_cost(costImpact);
      if (!paid) return false;
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

  protected apply_skill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.effects.onUseSkill(innerImpact, outerImpact);
  }

  protected check_impact(
    influenced: InfluenceList
  ): boolean {
    let key: Attribute;
    for (key in influenced) {
      const inner_value = influenced[key];
      const current_value = this.attributes[key].value;
      const result = current_value - inner_value;
      if (result < 0) return false;
    }
    return true;
  }

  protected apply_interaction(
    impact: Impact,
  ) {
    if (!impact.rules.range) return;
    const result = this.world.interact(this, impact);
    if (result) this.skills.interactResult(result);
  }
}
