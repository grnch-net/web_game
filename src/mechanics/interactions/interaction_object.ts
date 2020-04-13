import {
  Impact,
  InfluenceList
} from './impact';

import {
  Influence,
  GradualInfluence,
} from './influences';

interface InteractResult {
  avoid?: boolean;
  hit?: boolean;
}

interface InteractionConfig {
  name?: string;
  specialClass?: string;
  innerStaticInfluence?: InfluenceList;
  innerGradualInfluence?: InfluenceList;
  outerStaticInfluence?: InfluenceList;
  outerGradualInfluence?: InfluenceList;
}

interface InteractionParameters {
  innerStaticInfluence?: InfluenceList;
  innerGradualInfluence?: InfluenceList;
  outerStaticInfluence?: InfluenceList;
  outerGradualInfluence?: InfluenceList;
}

type CustomsList = { [id: string]: typeof InteractionObject };

class InteractionObject {
  static customs: CustomsList;

  static AddCustomClass(
    id: string,
    custom: typeof InteractionObject
  ) {
    if (!this.hasOwnProperty('customs')) {
      this.customs = {};
    }
    this.customs[id] = custom;
  }

  protected config: InteractionConfig;
  protected parameters: InteractionParameters;
  protected inner_static_influence: Influence;
  protected inner_gradual_influence: GradualInfluence;
  protected outer_static_influence: Influence;
  protected outer_gradual_influence: GradualInfluence;

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
    result: InteractResult
  ) {}
}

export {
  InteractResult,
  InteractionConfig,
  InteractionParameters,
  InteractionObject
}
