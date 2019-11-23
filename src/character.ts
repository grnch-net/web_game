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
    if (value > this.max) this._value = this.max;
    this._value = value;
  }
}

class EffectsManager {
  list: effects.Effect[] = [];

  add(effects: effects.Effect|effects.Effect[]) {
    if (!Array.isArray(effects)) {
      effects = [effects];
    }
    effects.forEach(effect => {
      if (!this.list.includes(effect)) {
        this.list.push(effect);
      }
      effect.added();
    });
  }

  remove(effect: effects.Effect) {
    if (!this.list.includes(effect)) {
      return;
    }
    const index = this.list.indexOf(effect);
    this.list.splice(index, 1);
    effect.removed();
  }

  tick(dt: number): any {
    return this.list.reduce((counter: any, effect) => {
      effect.tick(dt);
      if (!effect.active) return this.remove(effect);
      effect.influences.forEach(influence => {
        const { attribute, perSecond } = influence;
        let value = influence.value;
        if (perSecond) value *= dt;
        counter[attribute] = counter[attribute] || 0;
        counter[attribute] += value;
      });
    }, {});
  }
}

const config = {
  health: 100,
  stamina: 150,
  stamina_regeneration: 10,
  experience_multiply: 1
};

export default class Character {
  health: Range;
  stamina: Range;
  experience: number;
  effects: EffectsManager;

  constructor() {
    this.initialize();
  }

  protected initialize() {
    this.health = new Range(config.health);
    this.stamina = new Range(config.stamina);
    this.initialize_effects();
  }

  protected initialize_effects() {
    this.effects = new EffectsManager();
    this.effects.add([
      new effects.StaminaRegeneration(config.stamina_regeneration)
    ]);
  }

  tick(dt: number) {
    this.effects.tick(dt);
    const influences = this.effects.tick(dt);
    this.updateAttributes(influences);
  }

  protected updateAttributes(influences: any) {
    this.health.max = config.health;
    this.stamina.max = config.stamina;
    Object.entries(influences)
    .forEach(([attribute, value]) => {
      addAttribute(this, attribute, value as number);
    });
  }

  upExperience(value: number) {
    this.experience += value * config.experience_multiply;
  }
}
