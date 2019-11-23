class Influence {
  public attribute: string;
  public value: number;
  public perSecond: boolean;

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
    this.perSecond = perSecond;
  }
}

export abstract class Effect {
  active: boolean;
  influences: Influence[];

  constructor(...options: any[]) {
    this.initialize(...options);
  }

  protected initialize(...options: any[]) {
    this.active = false;
    this.influences = [];
  }

  tick(dt: number) {}

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
    influence.set('health.value', value, true);
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
    influence.set('stamina.value', value, true);
    this.addInfluence(influence);
  }
}

export class Weariness extends Effect {

}
