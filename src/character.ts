import * as utils from './utils';
import * as effects from './effects/index';
import * as skills from './skills';
import * as equipments from './equipments';
import { attributes } from "./influences";

const DEFAULT_CONFIG: any = {
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
    unique: 'inherentStaminaRegeneration',
    gradualInfluences: [{
      attribute: attributes.stamina,
      value: 0.1
    }]
  }],
  skills: [
    'Recreation',
    'Attack'
  ],
  equipments: [],
  armorProtect: 0.9
};

export default class Character {
  name: string;
  attributes: ({ [name: string]: utils.Range });
  counters: ({ [name: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;
  equipments: equipments.Controller;
  world: any;

  constructor(
    parameters: any,
    config?: any,
    ...options: any[]
  ) {
    this.initialize(parameters, config, ...options);
  }

  protected initialize(
    parameters: any,
    config?: any,
    ...options: any[]
  ) {
    config = config || DEFAULT_CONFIG;
    this.initialize_attributes(parameters.attributes, config.attributes);
    this.initialize_counters(parameters.counters, config.counters);
    this.initialize_effects(parameters.effects, config.effects);
    this.initialize_skills(parameters.skills, config.skills);
    this.initialize_equipments(parameters.equipments, config.equipments);
  }

  protected initialize_attributes(
    parameters: any,
    config: any
  ) {
    this.attributes = {};
    for (let name in config) {
      const range = { ...config[name], ...parameters[name] };
      const { max, value, min } = range;
      this.attributes[name] = new utils.Range(max, value, min);
    }
  }

  protected initialize_counters(
    parameters: any,
    config: any
  ) {
    this.counters = { ...config, ...parameters };
  }

  protected initialize_effects(
    parameters: any,
    config: any
  ) {
    this.effects = new effects.Controller();
    const impact = {};
    const list = [...config, ...parameters];
    for (const parameters of list) {
      const effect = new effects.Effect(parameters);
      this.effects.add(effect, impact);
    }
    this.applyImpact(impact);
  }

  protected initialize_skills(
    parameters: any,
    config: any
  ) {
    this.skills = new skills.Controller();
    for (const name of config) {
      const skill = new skills.list[name]();
      this.skills.add(skill);
    }
  }

  protected initialize_equipments(
    parameters: any,
    config: any
  ) {
    const impact = {};
    this.equipments = new equipments.Controller();
    for (const parameters of config.equipments) {
      const config = equipments.findConfig(parameters.id);
      if (!config) continue;
      const equip = new equipments.Equip(config, parameters);
      this.equipments.add(equip, impact);
    }
    this.applyImpact(impact);
  }

  tick(
    dt: number,
    innerImpact: any = {}
  ) {
    const outerImpact = {};
    this.effects.tick(dt, innerImpact, outerImpact);
    const skill_interact = this.tick_skills(dt, innerImpact, outerImpact);
    const { outerEffects, rules } = skill_interact || {};
    this.applyImpact(innerImpact);
    this.applyInteract(rules, outerImpact, outerEffects);
  }

  protected tick_skills(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ): any {
    const result = this.skills.tick(dt, innerImpact, outerImpact);
    if (!result) return null;
    const { innerEffects, outerEffects, rules, cost } = result;
    const success = this.apply_skill({
      innerImpact, outerImpact, innerEffects, outerEffects, rules, cost
    });
    if (!success) {
      this.skills.cancelUse();
      return null;
    }
    return {
      outerEffects,
      rules
    }
  }

  protected apply_weariness(
    impact: any
  ) {
    if (!impact[attributes.stamina]) return;
    let multiply = 1;
    const stamina = this.attributes.stamina.value;
    if (stamina < 1) {
      multiply *= stamina * 0.5 + 0.5;
    }
    multiply *= this.attributes.weariness.value;
    impact[attributes.stamina] *= multiply;
  }

  applyImpact(
    impact: any
  ) {
    for (let name in impact) {
      const value: number = impact[name];
      utils.addAttribute(this, name, value);
    }
  }

  applyOuterImpact(
    impact: any
  ) {
    this.effects.onOuterImpact(impact);
    this.skills.onOuterImpact(impact);
    this.armor_protection(impact);
    this.applyImpact(impact);
  }

  protected armor_protection(
    impact: any
  ): boolean {
    let health = impact[attributes.health];
    if (!health || health > 0) return false;
    if (-health <= this.counters.armor) {
      health *= DEFAULT_CONFIG.armorProtect;
    } else {
      health += this.counters.armor * DEFAULT_CONFIG.armorProtect;
    }
    impact[attributes.health] = health;
    return true;
  }

  useSkill(
    name: string
  ): boolean {
    const skill = this.skills.getToUse(name);
    if (!skill) return false;
    const paid = this.apply_cost(skill.cost);
    if (!paid) return false;
    const {
      innerImpact, outerImpact, innerEffects, outerEffects, rules
    } = skill.use();
    this.apply_skill({ innerImpact, outerImpact, innerEffects, rules });
    this.skills.using = skill;
    this.applyImpact(innerImpact);
    this.applyInteract(rules, outerImpact, outerEffects);
    return true;
    // TODO: apply equipments attributes
  }

  protected apply_cost(
    impact: any
  ) {
    if (!impact) return true;
    const checked = this.checkImpact(impact);
    if (!checked) return false;
    this.applyImpact(impact);
    return true;
  }

  protected apply_skill({
    innerImpact = {},
    outerImpact = {},
    innerEffects,
    rules,
    cost
  }: any): boolean {
    const paid = this.apply_cost(cost);
    if (!paid) return false;
    this.effects.onUseSkill(innerImpact, outerImpact);
    innerEffects.forEach((effect: effects.Effect) => {
      this.effects.add(effect, innerImpact);
    });
    return true;
  }

  checkImpact(
    impact: any
  ): boolean {
    for (let name in impact) {
      const impactValue: number = impact[name];
      const attributeValue = utils.getAttribute(this, name);
      const result = attributeValue + impactValue;
      if (result < 0) return false;
    }
    return true;
  }

  protected applyInteract(
    rules: any,
    impact: any,
    effects: any
  ) {
    this.world.interact(this, { impact, effects, rules });
  }

  // TODO: add equipments

}
