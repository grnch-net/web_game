import { WorldObject } from './world_object';
import { Impact, Attribute, InteractResult } from './interactions/index';
import { Range, RangeParameters } from './utils';
import { characterConfig } from './configs/character';
import { EffectsController, EffectParameters } from './effects/index';
import { EquipsController, EquipParameters } from './equips/index';
import { SkillsController, Skill, SkillParameters } from './skills/index';

type Attributes = { [key in Attribute]?: RangeParameters };
type Counters = { [key: string]: number };
type AttributesRange = { [key in Attribute]?: Range };

export interface CharacterConfig {
  attributes: Attributes;
  counters: Counters;
  effects: EffectParameters[];
  skills: SkillParameters[];
  equips: EquipParameters[];
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
    parameters: EquipParameters[],
    config: EquipParameters[],
    armorProtect: number
  ) {
    this.equips = new EquipsController;
    const impact = new Impact;
    const list = [...config, ...parameters];
    this.equips.initialize(list, impact, armorProtect);
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
    for (const effect of innerImpact.effects) {
      this.effects.add(effect, innerImpact);
    }
    let key: Attribute;
    for (key in innerImpact.positive) {
      const value = innerImpact.positive[key];
      this.attributes[key].value += value;
    }
    for (key in innerImpact.negative) {
      const value = innerImpact.negative[key];
      this.attributes[key].value -= value;
    }
  }

  interact(
    innerImpact: Impact
  ): InteractResult {
    this.effects.onOuterImpact(innerImpact);
    const result = this.skills.onOuterImpact(innerImpact);
    this.equips.onOuterImpact(innerImpact);
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
        equips: this.equips.getSlots(skill.needs.equips)
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
    impact: Impact
  ) {
    const checked = this.check_impact(impact);
    if (!checked) return false;
    this.apply_impact(impact);
    return true;
  }

  protected apply_skill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.effects.onUseSkill(innerImpact, outerImpact);
  }

  protected check_impact(
    impact: Impact
  ): boolean {
    let key: Attribute;
    for (key in impact.negative) {
      const impact_value = impact.negative[key];
      const current_value = this.attributes[key].value;
      const result = current_value - impact_value;
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
