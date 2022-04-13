import {
  Impact,
  InfluenceList
} from './impact';

import {
  Influence,
  GradualInfluence,
} from './influences';

interface TargetInteractResult {
  avoid?: boolean;
  hit?: boolean;
}

interface InteractResult {
  authorIndex: number;
  skill: string | number;
  targets: TargetInteractResult[];
}

interface InteractionConfig {
  name?: string;
  innerStaticInfluence?: InfluenceList;
  innerGradualInfluence?: InfluenceList;
  outerStaticInfluence?: InfluenceList;
  outerGradualInfluence?: InfluenceList;
}

interface InteractionParameters {
  name?: string;
  innerStaticInfluence?: InfluenceList;
  innerGradualInfluence?: InfluenceList;
  outerStaticInfluence?: InfluenceList;
  outerGradualInfluence?: InfluenceList;
}

class InteractionObject {

  protected config: InteractionConfig;
  protected parameters: InteractionParameters;
  protected inner_static_influence: Influence;
  protected inner_gradual_influence: GradualInfluence;
  protected outer_static_influence: Influence;
  protected outer_gradual_influence: GradualInfluence;

  get name(): string {
    return this.config.name;
  }

  initialize(
    config: InteractionConfig,
    parameters: InteractionParameters
  ) {
    this.config = config;
    this.parameters = parameters;
    this.update_influences(config, parameters);
  }

  protected update_influences(
    config: InteractionConfig,
    parameters: InteractionParameters
  ) {
    this.inner_static_influence = new Influence({
      ...config.innerStaticInfluence,
      ...parameters.innerStaticInfluence
    });
    this.inner_gradual_influence = new GradualInfluence({
      ...config.innerGradualInfluence,
      ...parameters.innerGradualInfluence
    });
    this.outer_static_influence = new Influence({
      ...config.outerStaticInfluence,
      ...parameters.outerStaticInfluence
    });
    this.outer_gradual_influence = new GradualInfluence({
      ...config.outerGradualInfluence,
      ...parameters.outerGradualInfluence
    });
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
    this.inner_gradual_influence.tick(dt, innerImpact.influenced);
    this.outer_gradual_influence.tick(dt, outerImpact.influenced);
  }

  onOuterImpact(
    innerImpact: Impact,
    result: TargetInteractResult
  ) {}

}

export {
  TargetInteractResult,
  InteractResult,
  InteractionConfig,
  InteractionParameters,
  InteractionObject
}
