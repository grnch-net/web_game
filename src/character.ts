import * as utils from './utils';
import * as effects from './effects';
import * as skills from './skills';
import { attributes } from "./influences";

const config: any = {
  attributes: {
    health: { max: 100 },
    stamina: { max: 1.5 },
    weariness: { max: 1, value: 0 }
  },
  counters: {
    armor: 0,
    experience: 0
  },
  effects: {
    StaminaRegeneration: 0.1,
    // WearinessRegeneration: -0.003
  },
  skills: {
    recreation: []
  },
  armorProtect: 0.9
};

export default class Character {
  name: string;
  attributes: ({ [name: string]: utils.Range });
  counters: ({ [name: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;
  world: any;

  constructor() {
    this.initialize();
  }

  protected initialize() {
    this.initialize_attributes();
    this.initialize_counters();
    this.initialize_effects();
    this.initialize_skills();
  }

  protected initialize_attributes() {
    this.attributes = {};
    for (let name in config.attributes) {
      const { max, value, min }: any = config.attributes[name];
      this.attributes[name] = new utils.Range(max, value, min);
    }
  }

  protected initialize_counters() {
    this.counters = {};
    for (let name in config.counters) {
      const value: number = config.counters[name];
      this.counters[name] = value;
    }
  }

  protected initialize_effects() {
    const impact = {};
    this.effects = new effects.Controller();
    for (let name in config.effects) {
      const value = config.effects[name];
      const args: any[] = utils.toArray(value);
      const effect = new effects.list[name](...args);
      this.effects.add(effect, impact);
    }
    this.applyImpact(impact);
  }

  protected initialize_skills() {
    this.skills = new skills.Controller();
    for (let name in config.skills) {
      const value = config.skills[name];
      const args: any[] = utils.toArray(value);
      const skill = new skills.list[name](...args);
      this.skills.add(skill);
    }
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
      health *= config.armorProtect;
    } else {
      health += this.counters.armor * config.armorProtect;
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
