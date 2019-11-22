import * as effects from './effects';

class Range {
  value: number;

  constructor(
    public max: number = 100,
    public min: number = 0
  ) {
    this.value = this.max;
  }

  set(value: number, force?: boolean): number {
    if (force) this.value = value;
    else if (value < this.min) this.value = this.min;
    else if (value > this.max) this.value = this.max;
    else this.value = value;
    return this.value;
  }
}

class EffectsManager {
  list: effects.Effect[] = [];

  add(effect: effects.Effect) {
    if (!this.list.includes(effect)) {
      this.list.push(effect);
    }
    effect.added();
  }

  remove(effect: effects.Effect) {
    if (!this.list.includes(effect)) {
      return;
    }
    const index = this.list.indexOf(effect);
    this.list.splice(index, 1);
    effect.removed();
  }

  tick(dt: number) {
    this.list.forEach(effect => {
      effect.tick(dt) || this.remove(effect);
    });
  }
}

const config = {
  health: 100,
  stamina: 150,
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
    this.effects = new EffectsManager();
  }

  tick(dt: number) {
    this.effects.tick(dt);
  }

  upExperience(value: number) {
    this.experience += value * config.experience_multiply;
  }
}
