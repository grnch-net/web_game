import * as utils from './utils';
import * as effects from './effects/index';
import * as skills from './skills/index';
import * as equips from './equips/index';
import { Impact, Attributes} from './interactions/index';

export interface CharacterParameters {
  attributes: ({ [key: string]: utils.RangeArguments });
  counters: ({ [key: string]: number });
  effects: effects.EffectParameters[];
  skills: skills.SkillParameters[];
  equips: equips.EquipParameters[];
  armorProtect?: number;
}

const DEFAULT_CONFIG: CharacterParameters = {
  attributes: {
    health: { max: 100 },
    stamina: { max: 1.5 },
    weariness: { max: 1, value: 0 }
  },
  counters: {
    armor: 0,
    experience: 0
  },
  effects: [{
    name: 'Inherent stamina regeneration',
    innerGradualInfluences: [{
      attribute: Attributes.Stamina,
      value: 0.1
    }]
  }],
  skills: [
    { id: 0, experience: 0 },
    { id: 1, experience: 0 }
  ],
  equips: [],
  armorProtect: 0.9
};

export class Character {
  name: string;
  attributes: ({ [name: string]: utils.Range });
  counters: ({ [name: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;
  equips: equips.Controller;
  world: any;

  initialize(
    parameters: CharacterParameters,
    config: CharacterParameters = DEFAULT_CONFIG
  ) {
    this.initialize_attributes(parameters.attributes, config.attributes);
    this.initialize_counters(parameters.counters, config.counters);
    this.initialize_effects(parameters.effects, config.effects);
    this.initialize_skills(parameters.skills, config.skills);
    this.initialize_equipments(parameters.equips, config.equips);
  }

  protected initialize_attributes(
    parameters: ({ [key: string]: utils.RangeArguments }),
    config: ({ [key: string]: utils.RangeArguments })
  ) {
    this.attributes = {};
    for (const key in config) {
      const range = { ...config[key], ...parameters[key] };
      const { max, value, min } = range;
      this.attributes[key] = new utils.Range(max, value, min);
    }
  }

  protected initialize_counters(
    parameters: ({ [key: string]: number }),
    config: ({ [key: string]: number })
  ) {
    this.counters = { ...config, ...parameters };
  }

  protected initialize_effects(
    parameters: effects.EffectParameters[],
    config: effects.EffectParameters[]
  ) {
    this.effects = new effects.Controller();
    const impact = new Impact;
    const list = [...config, ...parameters];
    for (const argument of list) {
      const effect = effects.utils.create(argument);
      this.effects.add(effect, impact);
    }
    this.applyImpact(impact);
  }

  protected initialize_skills(
    parameters: skills.SkillParameters[],
    config: skills.SkillParameters[]
  ) {
    this.skills = new skills.Controller();
    const list = [...config, ...parameters];
    for (const argument of list) {
      const skill = skills.utils.create(argument);
      this.skills.add(skill);
    }
  }

  protected initialize_equipments(
    parameters: equips.EquipParameters[],
    config: equips.EquipParameters[]
  ) {
    this.equips = new equips.Controller();
    const impact = new Impact;
    const list = [...config, ...parameters];
    for (const argument of list) {
      const equip = equips.utils.create(argument);
      this.equips.add(equip, impact);
    }
    this.applyImpact(impact);
  }

  tick(
    dt: number,
    innerImpact: Impact
  ) {
    const outerImpact = new Impact;
    this.tick_skills(dt, innerImpact, outerImpact);
    this.effects.tick(dt, innerImpact, outerImpact);
    this.applyImpact(innerImpact);
    this.applyInteract(outerImpact);
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

  protected apply_weariness(
    impact: Impact
  ) {
    if (!impact.negative[Attributes.Stamina]) return;
    let multiply = 1;
    const stamina = this.attributes.stamina.value;
    if (stamina < 1) {
      multiply *= stamina * 0.5 + 0.5;
    }
    multiply *= this.attributes.weariness.value;
    impact.negative[Attributes.Stamina] *= multiply;
  }

  applyImpact(
    impact: Impact
  ) {
    for (const effect of impact.effects) {
      this.effects.add(effect, impact);
    }
    for (let key in impact.positive) {
      const index: Attributes = +key;
      const value = impact.positive[index];
      const attribute = Attributes[+index];
      this.attributes[attribute].value += value;
    }
    for (let key in impact.negative) {
      const index: Attributes = +key;
      const value = impact.negative[index];
      const attribute = Attributes[+index];
      this.attributes[attribute].value -= value;
    }
  }

  applyOuterImpact(
    impact: Impact
  ) {
    this.effects.onOuterImpact(impact);
    this.skills.onOuterImpact(impact);
    this.armor_protection(impact);
    this.applyImpact(impact);
  }

  protected armor_protection(
    impact: Impact
  ): boolean {
    let health = impact.negative[Attributes.Health];
    if (!health || health < 0) return false;
    if (-health <= this.counters.armor) {
      health *= DEFAULT_CONFIG.armorProtect;
    } else {
      health += this.counters.armor * DEFAULT_CONFIG.armorProtect;
    }
    impact.negative[Attributes.Health] = health;
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
      const stocked = this.checkImpact(stockImpact);
      if (!stocked) return false;
    }
    const costImpact = skill.getCostImpact();
    if (costImpact) {
      const paid = this.apply_cost(costImpact);
      if (!paid) return false;
    }
    const innerImpact = new Impact();
    const outerImpact = new Impact();
    skill.use(innerImpact, outerImpact);
    this.skills.using = skill;
    this.apply_skill(innerImpact, outerImpact);
    this.applyImpact(innerImpact);
    this.applyInteract(outerImpact);
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
    const checked = this.checkImpact(impact);
    if (!checked) return false;
    this.applyImpact(impact);
    return true;
  }

  protected apply_skill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.effects.onUseSkill(innerImpact, outerImpact);
  }

  checkImpact(
    impact: Impact
  ): boolean {
    for (let key in impact.negative) {
      const index: Attributes = +key;
      const impact_value = impact.negative[index];
      const attribute = Attributes[index];
      const current_value = this.attributes[attribute].value;
      const result = current_value - impact_value;
      if (result < 0) return false;
    }
    return true;
  }

  protected applyInteract(
    impact: Impact,
  ) {
    this.world.interact(this, impact);
  }
}
