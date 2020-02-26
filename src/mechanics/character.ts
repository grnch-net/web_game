import { WorldObject } from './world_object';
import { Impact, Attributes, InteractResult } from './interactions/index';
import { Range, RangeArguments } from './utils';
import * as effects from './effects/index';
import * as skills from './skills/index';
import * as equips from './equips/index';

type AttributesData = { [key in Attributes]?: RangeArguments };
type CountersData = { [key: string]: number };

export interface CharacterData {
  attributes: AttributesData;
  counters: CountersData;
  effects: effects.EffectParameters[];
  skills: skills.SkillParameters[];
  equips: equips.EquipParameters[];
  armorProtect?: number;
}

const DEFAULT_CONFIG: CharacterData = {
  attributes: {
    [Attributes.Health]: { max: 100 },
    [Attributes.Stamina]: { max: 150 }
  },
  counters: {
    armor: 0,
    experience: 0
  },
  effects: [
    {
      name: 'Inherent stamina regeneration',
      innerGradualInfluences: [
        {
          attribute: Attributes.Stamina,
          value: 5
        }
      ]
    }
  ],
  skills: [
    { id: 0 }
  ],
  equips: [],
  armorProtect: 0.9
};

export class Character extends WorldObject {
  name: string;
  attributes: ({ [key in Attributes]?: Range });
  counters: ({ [key: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;
  equips: equips.Controller;
  armorProtect: number;

  initialize(
    parameters: CharacterData,
    config: CharacterData = DEFAULT_CONFIG
  ) {
    super.initialize();
    this.armorProtect = parameters.armorProtect | config.armorProtect;
    this.initialize_attributes(parameters.attributes, config.attributes);
    this.initialize_counters(parameters.counters, config.counters);
    this.initialize_effects(parameters.effects, config.effects);
    this.initialize_skills(parameters.skills, config.skills);
    this.initialize_equipments(parameters.equips, config.equips);
    this.armorProtect = config.armorProtect;
  }

  protected initialize_attributes(
    parameters: AttributesData,
    config: AttributesData
  ) {
    this.attributes = {};
    for (const key in Attributes) {
      const range = {
        ...config[key as Attributes],
        ...parameters[key as Attributes]
      };
      const { max, value, min } = range;
      this.attributes[key as Attributes] = new Range(max, value, min);
    }
  }

  protected initialize_counters(
    parameters: CountersData,
    config: CountersData
  ) {
    this.counters = { ...config, ...parameters };
  }

  protected initialize_effects(
    parameters: effects.EffectParameters[],
    config: effects.EffectParameters[]
  ) {
    this.effects = new effects.Controller();
    this.effects.initialize();
    const impact = new Impact;
    const list = [...config, ...parameters];
    for (const effect_parameters of list) {
      const effect = effects.utils.create(effect_parameters);
      this.effects.add(effect, impact);
    }
    this.apply_impact(impact);
  }

  protected initialize_skills(
    parameters: skills.SkillParameters[],
    config: skills.SkillParameters[]
  ) {
    this.skills = new skills.Controller();
    this.skills.initialize();
    const list = [...config, ...parameters];
    for (const skill_parameters of list) {
      const skill = skills.utils.create(skill_parameters);
      this.skills.add(skill);
    }
  }

  protected initialize_equipments(
    parameters: equips.EquipParameters[],
    config: equips.EquipParameters[]
  ) {
    this.equips = new equips.Controller();
    this.equips.initialize();
    const impact = new Impact;
    const list = [...config, ...parameters];
    for (const equip_parameters of list) {
      const equip = equips.utils.create(equip_parameters);
      this.equips.add(equip, impact);
    }
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
    if (this.skills.using) {
      const costImpact = this.skills.using.getGradualCostImpact();
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
    for (const key in innerImpact.positive) {
      const value = innerImpact.positive[key as Attributes];
      this.attributes[key as Attributes].value += value;
    }
    for (const key in innerImpact.negative) {
      const value = innerImpact.negative[key as Attributes];
      this.attributes[key as Attributes].value -= value;
    }
  }

  interact(
    innerImpact: Impact
  ): InteractResult {
    this.effects.onOuterImpact(innerImpact);
    const result = this.skills.onOuterImpact(innerImpact);
    this.armor_protection(innerImpact);
    this.apply_impact(innerImpact);
    return result;
  }

  protected armor_protection(
    impact: Impact
  ): boolean {
    let damage = impact.negative[Attributes.Health];
    if (!damage || damage < 0) return false;
    if (damage > this.counters.armor) {
      damage -= this.counters.armor * this.armorProtect;
    } else {
      damage *= 1 - this.armorProtect;
    }
    impact.negative[Attributes.Health] = damage;
    return true;
  }

  useSkill(
    id: string | number
  ): boolean {
    const skill = this.skills.getToUse(id);
    if (!skill) return false;
    if (skill.needs) {
      const result = this.get_needs(skill.needs);
      const checked = skill.checkNeeds(result);
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
    const innerImpact = new Impact();
    const outerImpact = new Impact();
    this.skills.use(skill, innerImpact, outerImpact);
    this.apply_skill(innerImpact, outerImpact);
    this.apply_impact(innerImpact);
    this.apply_interaction(outerImpact);
    return true;
  }

  protected get_needs(
    needs: skills.SkillNeeds
  ): skills.SkillNeedsResult {
    let equips: equips.Equip[];
    if (needs.equips) {
      equips = [];
      for (const slot of needs.equips) {
        const equip = this.equips.getSlot(slot);
        equips.push(equip);
      }
    }
    return { equips };
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
    for (const key in impact.negative) {
      const impact_value = impact.negative[key as Attributes];
      const current_value = this.attributes[key as Attributes].value;
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
