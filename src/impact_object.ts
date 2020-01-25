import { Influence, GradualInfluence, attributes } from './influences';

export default abstract class ImpactObject {

  protected inner_static_influences: Influence[];
  protected inner_gradual_influences: GradualInfluence[];
  protected outer_static_influences: Influence[];
  protected outer_gradual_influences: GradualInfluence[];

  constructor(
    ...options: any[]
  ) {
    this.initialize(...options);
    this.initialize_influences(...options);
  }

  protected initialize(
    ...options: any[]
  ) {
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
  }

  protected initialize_influences(
    ...options: any[]
  ) {}

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
    this.inner_gradual_influences
    .forEach(influence => influence.tick(dt, innerImpact));
    this.outer_gradual_influences
    .forEach(influence => influence.tick(dt, outerImpact));
  }

  onOuterImpact(
    impact: any
  ): any {}

  onUseSkill(
    innerImpact: any,
    outerImpact: any
  ) {}

}
