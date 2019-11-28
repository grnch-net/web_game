import { Influence, attributes } from './influences';

export class Controller {
  list: Effect[] = [];

  add(effects: Effect|Effect[]) {
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

  remove(effect: Effect) {
    if (!this.list.includes(effect)) {
      return;
    }
    const index = this.list.indexOf(effect);
    this.list.splice(index, 1);
    effect.removed();
  }

  tick(dt: number, counter: any): any {
    return this.list.forEach(effect => {
      if (!effect.active) return;
      effect.tick(dt);
      effect.influences.forEach(influence => {
        const { attribute, deltaValue } = influence;
        counter[attribute] = counter[attribute] || 0;
        counter[attribute] += deltaValue;
      });
      if (effect.once) {
        this.remove(effect);
      }
    });
  }

  onUseSkill(inner_influence: any, outer_influence: any) {
    this.list.forEach(effect => {
      if (!effect.active) return;
      effect.onUseSkill(inner_influence, outer_influence);
    });
  }
}

export abstract class Effect {
  active: boolean;
  influences: Influence[];
  once: boolean;
  liveTimer: number;

  constructor(...options: any[]) {
    this.initialize(...options);
    this.initialize_inflience(...options);
  }

  protected initialize(...options: any[]) {
    this.active = false;
    this.influences = [];
    this.once = false;
    this.liveTimer = Infinity;
  }

  protected initialize_inflience(...options: any[]) {}

  tick(dt: number) {
    if (dt < this.liveTimer) {
      this.liveTimer -= dt;
    } else {
      dt = this.liveTimer;
      this.liveTimer = 0;
      this.once = true;
    }
    this.influences.forEach(influence => influence.tick(dt))
  }

  added() {
    this.active = true;
  }

  removed() {
    this.active = false;
  }

  addInfluence(influence: Influence) {
    this.influences.push(influence);
  }

  onUseSkill(inner_influence: any, outer_influence: any) {}
}

export class HealthRegeneration extends Effect {
  constructor(value: number, time?: number) {
    super(value, time);
  }

  protected initialize(value: number, time?: number) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_inflience(value: number) {
    const influence = new Influence();
    influence.set(attributes.healthValue, value, true);
    this.addInfluence(influence);
  }
}

export class StaminaRegeneration extends Effect {
  constructor(value: number) {
    super(value);
  }

  protected initialize_inflience(value: number) {
    const influence = new Influence();
    influence.set(attributes.staminaValue, value, true);
    this.addInfluence(influence);
  }
}

export class Weariness extends Effect {
  increment: number;
  decrement: number;
  counter: Influence;

  get value() {
    // return Math.floor(this.counter.value);
    return this.counter.value;
  }

  set value(value) {
    this.counter.value = value;
  }

  constructor(increment: number, decrement: number) {
    super(increment, decrement);
  }

  protected initialize(increment: number, decrement:number) {
    super.initialize();
    this.increment = increment;
    this.decrement = decrement;
  }

  protected initialize_inflience(increment: number, decrement: number) {
    const influence = new Influence();
    influence.set(attributes.staminaMax, 0);
    this.addInfluence(influence);
    this.counter = influence;
  }

  onUseSkill(inner_influence: any, outer_influence: any) {
    if (!inner_influence[attributes.staminaValue]) return;
    this.counter.value -= this.decrement;
  }

  tick(dt: number) {
    super.tick(dt);
    if (!this.counter.value) return;
    this.counter.value += this.increment * dt;
    if (this.counter.value > 0) {
      this.counter.value = 0;
    }
  }
}

export class Damage extends Effect {
  constructor(value: number) {
    super(value);
  }

  protected initialize() {
    super.initialize();
    this.once = true;
  }

  protected initialize_inflience(value: number) {
    value *= -1;
    const influence = new Influence();
    influence.set(attributes.healthValue, value);
    this.addInfluence(influence);
  }
}
