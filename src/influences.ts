export enum attributes {
  healthValue = 'attributes.health.value',
  healthMax = 'attributes.health.max',
  staminaValue = 'attributes.stamina.value',
  staminaMax = 'attributes.stamina.max',
  wearinessValue = 'attributes.weariness.value'
}

export enum influenceTypes {
  positive,
  negative,
  native,
  unimportant
}

export class Influence {
  attribute: string;
  value: number;

  set(
    attribute: string|string[],
    value: number
  ) {
    if (Array.isArray(attribute)) {
      attribute = attribute.join('.');
    }
    this.attribute = attribute as string;
    this.value = value;
  }

  apply(impact: any) {
    impact[this.attribute] = impact[this.attribute] || 0;
    impact[this.attribute] += this.value;
  }

  cancel(impact: any) {
    impact[this.attribute] = impact[this.attribute] || 0;
    impact[this.attribute] -= this.value;
  }
}

export  class GradualInfluence extends Influence {
  deltaValue: number;

  set(
    attribute: string|string[],
    valuePerSecond: number
  ) {
    super.set(attribute, valuePerSecond);
    this.deltaValue = 0;
  }

  tick(dt: number, impact: any) {
    this.deltaValue = this.value * dt;
    this.apply(impact);
  }

  apply(impact:any) {
    impact[this.attribute] = impact[this.attribute] || 0;
    impact[this.attribute] += this.deltaValue;
  }

  cancel(impact:any) {
    impact[this.attribute] = impact[this.attribute] || 0;
    impact[this.attribute] -= this.deltaValue;
  }

}
