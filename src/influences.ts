export enum attributes {
  healthValue = 'health.value',
  healthMax = 'health.max',
  staminaValue = 'stamina.value',
  staminaMax = 'stamina.max'
}

export class Influence {
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
