import * as impact from '../impact_object';

export interface iParameters extends impact.iParameters{
  specialClass?: string | number;
  unique?: string;
  time?: number;
}

export class Effect extends impact.ImpactObject {
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

  // protected initialize_influences(
  //   parameters: iParameters
  // ) {
  //   super.initialize_influences();
  // }

  added(
    innerImpact: any
  ) {
    if (!this.active) {
      for (const influence of this.inner_static_influences) {
        influence.apply(innerImpact);
      }
    }
    this.active = true;
  }

  removed(
    innerImpact: any
  ) {
    if (this.active) {
      for (const influence of this.inner_static_influences) {
        influence.cancel(innerImpact);
      }
    }
    this.active = false;
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
