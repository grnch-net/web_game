import { Impact, Attribute } from './impact';

export interface InfluenceParameters {
  attribute: Attribute;
  value: number;
  negative?: boolean;
}

export class Influence {
  constructor(
    protected parameters: InfluenceParameters
  ) {}

  get attribute(): Attribute {
    return this.parameters.attribute;
  }

  get value(): number {
    return this.parameters.value;
  }

  get negative(): boolean {
    return this.parameters.negative || false;
  }

  apply(
    impact: Impact
  ) {
    this.update_impact(impact);
  }

  cancel(
    impact: Impact
  ) {
    this.update_impact(impact, true);
  }

  protected update_impact(
    impact: Impact,
    isCancel = false
  ) {
    const multiply = isCancel ? -1 : 1;
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] += this.value * multiply;
  }
}

export class GradualInfluence extends Influence {
  deltaValue: number;

  constructor(
    parameters: InfluenceParameters
  ) {
    super(parameters);
    this.deltaValue = 0;
  }

  tick(
    dt: number,
    impact?: Impact
  ) {
    this.deltaValue = this.value * dt;
    impact && this.apply(impact);
  }

  protected update_impact(
    impact: Impact,
    isCancel = false
  ) {
    const multiply = isCancel ? -1 : 1;
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] += this.deltaValue * multiply;
  }
}
