import { Influence, GradualInfluence, attributes } from './influences';

export interface iParameters {
  innerStaticInfluences?: any[];
  innerGradualInfluences?: any[];
  outerStaticInfluences?: any[];
  outerGradualInfluences?: any[];
}


export abstract class ImpactObject {

  protected inner_static_influences: Influence[];
  protected inner_gradual_influences: GradualInfluence[];
  protected outer_static_influences: Influence[];
  protected outer_gradual_influences: GradualInfluence[];

  constructor(
    parameters: iParameters,
    ...options: any[]
  ) {
    this.initialize(parameters, ...options);
    this.initialize_influences(parameters, ...options);
  }

  protected initialize(
    // parameters: iParameters,
    ...options: any[]
  ) {
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
  }

  protected initialize_influences(
    parameters: iParameters,
    ...options: any[]
  ) {
    const {
      innerStaticInfluences,
      innerGradualInfluences,
      outerStaticInfluences,
      outerGradualInfluences
    } = parameters;
    for (const { attribute, value } of innerStaticInfluences) {
      this.add_inner_static_influence(attribute, value);
    }
    for (const { attribute, value } of innerGradualInfluences) {
      this.add_inner_gradual_influence(attribute, value);
    }
    for (const { attribute, value } of outerStaticInfluences) {
      this.add_outer_static_influence(attribute, value);
    }
    for (const { attribute, value } of outerGradualInfluences) {
      this.add_outer_gradual_influence(attribute, value);
    }
  }

  protected add_inner_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.inner_static_influences.push(influence);
  }

  protected add_inner_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.inner_gradual_influences.push(influence);
  }

  protected add_outer_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.outer_static_influences.push(influence);
  }

  protected add_outer_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.outer_gradual_influences.push(influence);
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ) {
    this.tick_influences(dt, innerImpact, outerImpact);
  }

  protected tick_influences(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ) {
    for (const influence of this.inner_gradual_influences) {
      influence.tick(dt, innerImpact);
    }
    for (const influence of this.outer_gradual_influences) {
      influence.tick(dt, outerImpact);
    }
  }

  onOuterImpact(
    impact: any
  ): any {}

  onUseSkill(
    innerImpact: any,
    outerImpact: any
  ) {}

}
