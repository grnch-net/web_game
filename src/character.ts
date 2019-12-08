import * as utils from './utils';
import * as effects from './effects';
import * as skills from './skills';
import { attributes } from "./influences";

class Range {
  _value: number;

  constructor(
    public max: number = 100,
    value?: number,
    public min: number = 0
  ) {
    if (value || value === 0) {
      this._value = value;
    } else {
      this._value = this.max;
    }
  }

  get value() { return this._value }
  set value(value: number) {
    if (value < this.min) this._value = this.min;
    else if (value > this.max) this._value = this.max;
    else this._value = value;
  }
}

const config = {
  attributes: {
    health: 100,
    stamina: 150,
    weariness: [1, 0]
  },
  counters: {
    armor: 0,
    experience: 0
  },
  effects: {
    StaminaRegeneration: 0.1,
    WearinessRegeneration: -0.003
  },
  skills: {},
  armorProtect: 0.9
};

export default class Character {
  name: string;
  attributes: ({ [name: string]: Range });
  counters: ({ [name: string]: number });
  effects: effects.Controller;
  skills: skills.Controller;

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
      const value = (config.attributes as any)[name];
      const args: any[] = (Array.isArray(value)) ? value : [value];
      this.attributes[name] = new Range(...args);
    }
  }

  protected initialize_counters() {
    this.counters = {};
    for (let name in config.counters) {
      const value: number = (config.counters as any)[name];
      this.counters[name] = value;
    }
  }

  protected initialize_effects() {
    this.effects = new effects.Controller();
    for (let name in config.effects) {
      const value = (config.effects as any)[name];
      const args: any[] = (Array.isArray(value)) ? value : [value];
      const effect = new effects.list[name](...args);
      this.effects.add(effect);
    }
  }

  protected initialize_skills() {}

  tick(dt: number, innerInfluences: any = {}) {
    this.effects.tick(dt, innerInfluences);
    this.applyImpact(innerInfluences);
  }

  protected apply_weariness(impact: any) {
    if (!impact[attributes.staminaValue]) return;
    const multiply = this.attributes.weariness.value;
    impact[attributes.staminaValue] *= multiply;
  }

  applyImpact(impact: any) {
    for (let name in impact) {
      let value: number = impact[name];
      utils.addAttribute(this, name, value);
    }
  }

  onOuterImpact(impact: any) {
    this.armor_protection(impact);
    this.effects.onOuterImpact(impact);
    this.applyImpact(impact);
  }

  protected armor_protection(impact: any) {
    let healthValue = impact[attributes.healthValue];
    if (!healthValue || healthValue > 0) return;
    if (-healthValue <= this.counters.armor) {
      healthValue *= config.armorProtect;
    } else {
      healthValue += this.counters.armor * config.armorProtect;
    }
    impact[attributes.healthValue] = healthValue;
  }

  useSkill(name: string) {
    const inner_impact = {};
    const outer_impact = {};
    this.effects.onUseSkill(inner_impact, outer_impact);
  }

}
