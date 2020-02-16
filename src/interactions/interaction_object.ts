import { Impact, Attributes } from './impact';
import { Influence, GradualInfluence, InfluenceArguments } from './influences';

export interface InteractResult {
  avoid?: boolean
}

export interface InteractionParameters {
  innerStaticInfluences?: InfluenceArguments[];
  innerGradualInfluences?: InfluenceArguments[];
  outerStaticInfluences?: InfluenceArguments[];
  outerGradualInfluences?: InfluenceArguments[];
}

export abstract class InteractionObject {

  protected inner_static_influences: Influence[];
  protected inner_gradual_influences: GradualInfluence[];
  protected outer_static_influences: Influence[];
  protected outer_gradual_influences: GradualInfluence[];

  initialize(
    parameters: InteractionParameters,
    ...options: any[]
  ) {
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
    this.initialize_influences(parameters, ...options);
  }

  protected initialize_influences(
    parameters: InteractionParameters,
    ...options: any[]
  ) {
    const {
      innerStaticInfluences = [],
      innerGradualInfluences = [],
      outerStaticInfluences = [],
      outerGradualInfluences = []
    } = parameters;
    for (const { attribute, value, negative } of innerStaticInfluences) {
      this.add_inner_static_influence(attribute, value, negative);
    }
    for (const { attribute, value, negative } of innerGradualInfluences) {
      this.add_inner_gradual_influence(attribute, value, negative);
    }
    for (const { attribute, value, negative } of outerStaticInfluences) {
      this.add_outer_static_influence(attribute, value, negative);
    }
    for (const { attribute, value, negative } of outerGradualInfluences) {
      this.add_outer_gradual_influence(attribute, value, negative);
    }
  }

  protected add_inner_static_influence(
    attribute: Attributes,
    value: number,
    negative?: boolean
  ) {
    const influence = new Influence();
    influence.set(attribute, value, negative);
    this.inner_static_influences.push(influence);
  }

  protected add_inner_gradual_influence(
    attribute: Attributes,
    value: number,
    negative: boolean
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value, negative);
    this.inner_gradual_influences.push(influence);
  }

  protected add_outer_static_influence(
    attribute: Attributes,
    value: number,
    negative: boolean
  ) {
    const influence = new Influence();
    influence.set(attribute, value, negative);
    this.outer_static_influences.push(influence);
  }

  protected add_outer_gradual_influence(
    attribute: Attributes,
    value: number,
    negative: boolean
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value, negative);
    this.outer_gradual_influences.push(influence);
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.tick_influences(dt, innerImpact, outerImpact);
  }

  protected tick_influences(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    for (const influence of this.inner_gradual_influences) {
      influence.tick(dt, innerImpact);
    }
    for (const influence of this.outer_gradual_influences) {
      influence.tick(dt, outerImpact);
    }
  }

  onOuterImpact(
    innerImpact: Impact
  ): InteractResult {
    return {};
  }
}
