import { addAttribute } from './utils';
import { attributes } from './influences';
import * as effects from './effects';
import * as skills from './skills';

class Range {
  _value: number;

  constructor(
    public max: number = 100,
    public min: number = 0
  ) {
    this._value = this.max;
  }

  get value() { return this._value }
  set value(value: number) {
    if (value < this.min) this._value = this.min;
    else if (value > this.max) this._value = this.max;
    else this._value = value;
  }
}

const config = {
  health: 100,
  stamina: 150,
  armor_protects: 0.9,
  stamina_regeneration: 10,
  weariness_increment: 1,
  weariness_decrement: 0.1,
  experience_multiply: 1
};

export default class Character {
  name: string;
  health: Range;
  stamina: Range;
  armor: number;
  experience: number;
  effects: effects.Controller;
  skills: skills.Controller;

  constructor() {
    this.initialize();
  }

  protected initialize() {
    this.health = new Range(config.health);
    this.stamina = new Range(config.stamina);
    this.update_armor();
    this.initialize_effects();
  }

  protected initialize_effects() {
    this.effects = new effects.Controller();
    this.effects.add([
      new effects.StaminaRegeneration(config.stamina_regeneration),
      new effects.Weariness(config.weariness_increment, config.weariness_decrement)
    ]);
  }

  tick(dt: number, innerInfluences: any = {}) {
    this.effects.tick(dt, innerInfluences);
    this.updateAttributes();
    this.applyInfluences(innerInfluences);
  }

  protected updateAttributes() {
    this.health.max = config.health;
    this.stamina.max = config.stamina;
  }

  protected update_armor() {
    this.armor = 0;
  }

  applyInfluences(influences: any, effects?: any) {
    for (let attribute in influences) {
      let value: number = influences[attribute];
      addAttribute(this, attribute, value);
    }
  }

  onOuterInfluences(
    isPhysical: boolean,
    influences: any,
    effects?: effects.Effect[]
  ) {
    if (influences) {
      let healthValue = influences[attributes.healthValue];
      if (isPhysical && healthValue && healthValue < 0) {
        healthValue = this.calculateProtects(healthValue);
        influences[attributes.healthValue] = healthValue;
      }
      this.applyInfluences(influences);
    }
    if (effects) {
      (effects as effects.Effect[])
      .forEach(effect => this.effects.add(effect));
    }
  }

  protected calculateProtects(value: number) {
    if (value < this.armor) {
      value *= 1 - config.armor_protects;
    } else {
      value += this.armor * config.armor_protects;
    }
    return value;
  }

  upExperience(value: number) {
    this.experience += value * config.experience_multiply;
  }

  useSkill(name: string) {
    const inner_influence = {};
    const outer_influence = {};
    this.effects.onUseSkill(inner_influence, outer_influence);
  }

}
