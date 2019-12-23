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

const config: any = {
  attributes: {
    health: 100,
    stamina: 1.5,
    weariness: [1, 0]
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
  attributes: ({ [name: string]: Range });
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
      const value = config.attributes[name];
      const args: any[] = utils.toArray(value);
      this.attributes[name] = new Range(...args);
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

  tick(dt: number, impact: any = {}) {
    this.effects.tick(dt, impact);
    this.applyImpact(impact);
  }

  protected apply_weariness(impact: any) {
    if (!impact[attributes.staminaValue]) return;
    let multiply = 1;
    const stamina = this.attributes.stamina.value;
    if (stamina < 1) {
      multiply *= stamina * 0.5 + 0.5;
    }
    multiply *= this.attributes.weariness.value;
    impact[attributes.staminaValue] *= multiply;
  }

  applyImpact(impact: any) {
    for (let name in impact) {
      let value: number = impact[name];
      utils.addAttribute(this, name, value);
    }
  }

  applyOuterImpact(impact: any) {
    this.armor_protection(impact);
    this.effects.onOuterImpact(impact);
    this.applyImpact(impact);
  }

  protected armor_protection(impact: any): boolean {
    let healthValue = impact[attributes.healthValue];
    if (!healthValue || healthValue > 0) return false;
    if (-healthValue <= this.counters.armor) {
      healthValue *= config.armorProtect;
    } else {
      healthValue += this.counters.armor * config.armorProtect;
    }
    impact[attributes.healthValue] = healthValue;
    return true;
  }

  useSkill(name: string): boolean {
    const result = this.skills.use(name);
    if (!result) return false;
    const {
      innerImpact = {},
      outerImpact = {},
      innerEffects = [],
      outerEffects,
      rules
    } = result;
    this.effects.onUseSkill(innerImpact, outerImpact);
    innerEffects.forEach((effect: effects.Effect) => {
      this.effects.add(effect, innerImpact);
    });
    this.applyImpact(innerImpact);
    this.world.interact(this, {
      impact: outerImpact,
      effects: outerEffects,
      rules: rules
    });
    return true;
  }

}
