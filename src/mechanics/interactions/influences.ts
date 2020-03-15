import { Impact, Attribute } from './impact';

// export enum influenceTypes {
//   positive,
//   negative,
//   native,
//   unimportant,
//   amplify
// }

export interface InfluenceArguments {
  attribute: Attribute;
  value: number;
  negative?: boolean;
}

export class Influence {
  attribute: Attribute;
  value: number;
  negative: boolean;

  set(
    attribute: Attribute,
    value: number,
    negative: boolean = false
  ) {
    this.attribute = attribute;
    this.value = value;
    this.negative = negative;
  }

  apply(
    impact: Impact
  ) {
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] += this.value;
  }

  cancel(
    impact: Impact
  ) {
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] -= this.value;
  }
}

export class GradualInfluence extends Influence {
  deltaValue: number;

  set(
    attribute: Attribute,
    valuePerSecond: number,
    negative: boolean = false
  ) {
    super.set(attribute, valuePerSecond, negative);
    this.deltaValue = 0;
  }

  tick(
    dt: number,
    impact: Impact
  ) {
    this.deltaValue = this.value * dt;
    this.apply(impact);
  }

  apply(
    impact: Impact
  ) {
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] += this.deltaValue;
  }

  cancel(
    impact: Impact
  ) {
    const side = (this.negative) ? impact.negative : impact.positive;
    side[this.attribute] = side[this.attribute] || 0;
    side[this.attribute] -= this.deltaValue;
  }
}
