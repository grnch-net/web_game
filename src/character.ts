import { addAttribute } from './utils';
import * as effects from './effects';

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
  armor: 0,
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

  constructor() {
    this.initialize();
  }

  protected initialize() {
    this.health = new Range(config.health);
    this.stamina = new Range(config.stamina);
    this.armor = config.armor;
    this.initialize_effects();
  }

  protected initialize_effects() {
    this.effects = new effects.Controller();
    this.effects.add([
      new effects.StaminaRegeneration(config.stamina_regeneration),
      new effects.Weariness(config.weariness_increment, config.weariness_decrement)
    ]);
  }

  tick(dt: number) {
    const influences_result = this.effects.tick(dt);
    this.updateAttributes();
    this.applyInfluences(influences_result);
  }

  protected updateAttributes() {
    this.health.max = config.health;
    this.stamina.max = config.stamina;
  }

  applyInfluences(influences_result: any) {
    Object.entries(influences_result)
    .forEach(([attribute, value]) => {
      addAttribute(this, attribute, value as number);
    });
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
