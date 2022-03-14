import {
  types
} from './types';

export interface RangeParameters {
  max?: number,
  value?: number,
  min?: number
}

class Range {
  get max(): number {
    if (types.isNumber(this.parameters.max)) return this.parameters.max;
    if (types.isNumber(this.config.max)) return this.config.max;
    return 100;
  }

  set max(
    value: number
  ) {
    this.parameters.max = value;
    this.parameters.value = Math.min(this.value, value);
  }

  get min(): number {
    if (types.isNumber(this.parameters.min)) return this.parameters.min;
    if (types.isNumber(this.config.min)) return this.config.min;
    return 0;
  }

  set min(
    value: number
  ) {
    this.parameters.min = value;
    this.parameters.value = Math.max(this.value, value);
  }

  get value() {
    return this.parameters.value;
  }

  set value(
    value: number
  ) {
    if (value < this.min) this.parameters.value = this.min;
    else if (value > this.max) this.parameters.value = this.max;
    else this.parameters.value = value;
  }

  constructor(
    protected config: RangeParameters,
    protected parameters: RangeParameters
  ) {
    if (!types.isNumber(parameters.value)) {
      if (types.isNumber(config.value)) parameters.value = config.value;
      else parameters.value = this.max;
    }
  }
}

export {
  Range
}

declare global {
  type RangeNumber = RangeParameters;
}
