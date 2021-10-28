import {
  Attribute,
  InfluenceList
} from './impact';

class Influence {
  protected parameters: InfluenceList

  constructor(
    parameters: InfluenceList
  ) {
    this.initialize(parameters);
  }

  protected initialize(
    parameters: InfluenceList
  ) {
    this.parameters = parameters;
  }

  apply(
    influenced: InfluenceList
  ) {
    this.update_impact(influenced);
  }

  cancel(
    influenced: InfluenceList
  ) {
    this.update_impact(influenced, true);
  }

  protected update_impact(
    influenced: InfluenceList,
    cancel = false
  ) {
    const operation = cancel ? -1 : 1;
    let attribute: Attribute;
    for (attribute in this.parameters) {
      const value = this.parameters[attribute];
      influenced[attribute] = influenced[attribute] || 0;
      influenced[attribute] += value * operation;
    }
  }
}

class GradualInfluence extends Influence {
  deltaValues: InfluenceList;

  protected initialize(
    parameters: InfluenceList
  ) {
    super.initialize(parameters);
    this.deltaValues = {};
    let attribute: Attribute;
    for (attribute in this.parameters) {
      this.deltaValues[attribute] = 0;
    }
  }

  tick(
    dt: number,
    influenced?: InfluenceList
  ) {
    let attribute: Attribute;
    for (attribute in this.parameters) {
      const value = this.parameters[attribute];
      this.deltaValues[attribute] = value * dt;
    }
    influenced && this.apply(influenced);
  }

  protected update_impact(
    influenced: InfluenceList,
    cancel = false
  ) {
    const operation = cancel ? -1 : 1;
    let attribute: Attribute;
    for (attribute in this.parameters) {
      const value = this.deltaValues[attribute];
      influenced[attribute] = influenced[attribute] || 0;
      influenced[attribute] += value * operation;
    }
  }
}

export {
  Influence,
  GradualInfluence
}
