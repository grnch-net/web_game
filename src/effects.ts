class Influence {
  attribute: string;
  value: number;
  perSecond: boolean;
  deltaValue: number;

  set(
    attribute: string|string[],
    value: number,
    perSecond: boolean = false
  ) {
    if (Array.isArray(attribute)) {
      attribute = attribute.join('.');
    }
    this.attribute = attribute as string;
    this.value = value;
    this.deltaValue = perSecond ? 0 : value;
  }

  tick(dt: number): boolean {
    if (!this.perSecond) return false;
    this.deltaValue = this.value * dt;
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

  onUseSkill(result: any): any {
    return result;
  }
}

export class HealthRegeneration extends Effect {
  constructor(value: number, time: number) {
    super(value, time);
  }

  initialize(value: number, time: number) {
    super.initialize();
    if (time) this.liveTimer = time;
  }

  protected initialize_inflience(value: number) {
    const influence = new Influence();
    influence.set('health.value', value, true);
    this.addInfluence(influence);
  }
}

export class StaminaRegeneration extends Effect {
  constructor(value: number) {
    super(value);
  }

  protected initialize_inflience(value: number) {
    const influence = new Influence();
    influence.set('stamina.value', value, true);
    this.addInfluence(influence);
  }
}

export class Weariness extends Effect {
  constructor() {
    super();
  }
}

export class Damage extends Effect {
  constructor(value: number) {
    super(value);
  }

  initialize() {
    super.initialize();
    this.once = true;
  }

  protected initialize_inflience(value: number) {
    value *= -1;
    const influence = new Influence();
    influence.set('health.value', value);
    this.addInfluence(influence);
  }
}
