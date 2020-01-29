import ImpactObject from '../impact_object';

interface iParameters {
  unique?: string;
  time?: number;
  staticInfluences?: any[];
  gradualInfluences?: any[];
}

export default class Effect extends ImpactObject {
  unique: string;
  active: boolean;
  ended: boolean;
  liveTimer: number;

  protected initialize(
    parameters: iParameters,
    ...options: any[]
  ) {
    super.initialize();
    this.active = false;
    this.ended = false;
    this.liveTimer = parameters.time || Infinity;
    if (parameters.unique) {
      this.unique = parameters.unique;
    }
  }

  protected initialize_influences(
    parameters: iParameters
  ) {
    super.initialize_influences();
    const {
      staticInfluences,
      gradualInfluences
    } = parameters;
    for (const { attribute, value } of staticInfluences) {
      this.add_inner_static_influence(attribute, value);
    }
    for (const { attribute, value } of gradualInfluences) {
      this.add_inner_gradual_influence(attribute, value);
    }
  }

  added(
    innerImpact: any
  ) {
    if (!this.active) {
      this.inner_static_influences
      .forEach(influence => influence.apply(innerImpact));
    }
    this.active = true;
  }

  removed(
    innerImpact: any
  ) {
    this.active = false;
    this.inner_static_influences
    .forEach(influence => influence.cancel(innerImpact));
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ) {
    if (dt < this.liveTimer) {
      this.liveTimer -= dt;
    } else {
      dt = this.liveTimer;
      this.liveTimer = 0;
      this.ended = true;
    }
    super.tick(dt, innerImpact, outerImpact);
  }

}
