enum influenceTypes {
  'static',
  'progressive'
}

class Influence {
  static types = influenceTypes;

  constructor(
    public type?: influenceTypes,
    public target?: string|string[],
    public value?: number
  ) {}

  set(
    type: influenceTypes,
    target: string|string[],
    value: number
  ) {
    this.type = type;
    this.target = target;
    this.value = value;
  }
}

export abstract class Effect {
  active: boolean;
  influences: Influence[];

  constructor(...options: any[]) {
    this.initialize(options);
  }

  protected initialize(...options: any[]) {
    this.active = false;
    this.influences = [];
  }

  tick(dt: number) {
    return this.active;
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
}



export class HealthRegeneration extends Effect {
  constructor(value: number) {
    super(value);
  }

  protected initialize(value: number) {
    super.initialize();
    this.initialize_inflience(value);
  }

  protected initialize_inflience(value: number) {
    const influence = new Influence();
    influence.set(
      Influence.types.progressive,
      ['health', 'value'],
      value
    );
    this.addInfluence(influence);
  }
}

export class StaminaRegeneration extends Effect {
  constructor(value: number) {
    super(value);
  }

  protected initialize(value: number) {
    super.initialize();
    this.initialize_inflience(value);
  }

  protected initialize_inflience(value:number) {
    const influence = new Influence();
    influence.set(
      Influence.types.progressive,
      ['stamina', 'value'],
      value
    );
    this.addInfluence(influence);
  }
}

export class Weariness extends Effect {

}
