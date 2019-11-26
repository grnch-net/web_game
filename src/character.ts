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
      if (!effect.active) return counter;
      effect.tick(dt);
      effect.influences.forEach(influence => {
        const { attribute, deltaValue } = influence;
        counter[attribute] = counter[attribute] || 0;
        counter[attribute] += deltaValue;
      });
      if (effect.once) {
        this.remove(effect);
      }
      return counter;
    }, {});
  }

  onUseSkill(influences_result: any): any {
    return this.list.reduce((counter: any, effect) => {
      if (!effect.active) return counter;
      return effect.onUseSkill(counter);
    }, influences_result);
  }
}

const config = {
  health: 100,
  stamina: 150,
  armor: 0,
  stamina_regeneration: 10,
  experience_multiply: 1
};

export default class Character {
  name: string;
  health: Range;
  stamina: Range;
  armor: number;
  experience: number;
  effects: EffectsManager;

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
    this.effects = new EffectsManager();
    this.effects.add([
      new effects.StaminaRegeneration(config.stamina_regeneration),
      new effects.Weariness()
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
    const influences_result = {};
    this.effects.onUseSkill(influences_result);
  }

}
