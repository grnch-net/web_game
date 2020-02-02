import * as utils from './utils';
import * as effects from './effects/index';
import * as skills from './skills/index';
import * as equips from './equips/index';
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
    name: 'Inherent stamina regeneration',
    innerGradualInfluences: [{
      attribute: attributes.stamina,
      value: 0.1
    }]
  }],
  skills: [
    { id: 0 },
    { id: 1 }
  ],
  equips: [],
  armorProtect: 0.9
};

export interface iParameters {
  attributes: ({ [key: string]: utils.iRangeArguments });
  counters: ({ [key: string]: number });
  effects: effects.iParameters[];
  skills: skills.iParameters[];
  equips: equips.iParameters[];
  armorProtect?: number;
}

export class Character {
  name: string;
  attributes: ({ [name: string]: utils.Range });
  counters: ({ [name: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;
  equips: equips.Controller;
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
    this.initialize_equipments(parameters.equips, config.equips);
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
    for (const argument of list) {
      const effect = effects.utils.create(argument);
      this.effects.add(effect, impact);
    }
    this.applyImpact(impact);
  }

  protected initialize_skills(
    parameters: any,
    config: any
  ) {
    this.skills = new skills.Controller();
    const list = [...config, ...parameters];
    for (const argument of list) {
      const skill = skills.utils.create(argument);
      this.skills.add(skill);
    }
  }

  protected initialize_equipments(
    parameters: any,
    config: any
  ) {
    const impact = {};
    this.equips = new equips.Controller();
    const list = [...config, ...parameters];
    for (const argument of list) {
      const equip = equips.utils.create(argument);
      this.equips.add(equip, impact);
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
    id: string | number
  ): boolean {
    const skill = this.skills.getToUse(id);
    if (!skill) return false;
    const stocked = this.checkImpact(skill.stock);
    if (!stocked) return false;
    const paid = this.apply_cost(skill.cost);
    if (!paid) return false;
    const {
      // innerImpact, outerImpact, innerEffects, outerEffects, rules
    } = skill.use();
    this.skills.using = skill;
    // this.apply_skill({ innerImpact, outerImpact, innerEffects, rules });
    // this.applyImpact(innerImpact);
    // this.applyInteract(rules, outerImpact, outerEffects);
    return true;
  }

  protected apply_cost(
    impact?: any
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
    // TODO: apply equips attributes
  }

  checkImpact(
    impact?: any
  ): boolean {
    if (!impact) return true;
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
}
