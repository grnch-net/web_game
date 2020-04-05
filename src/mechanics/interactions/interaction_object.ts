import {
  Impact
} from './impact';

import {
  Influence,
  GradualInfluence,
  InfluenceParameters
} from './influences';

interface InteractResult {
  avoid?: boolean
}

interface InteractionConfig {
  name?: string;
  specialClass?: string;
  innerStaticInfluences?: InfluenceParameters[];
  innerGradualInfluences?: InfluenceParameters[];
  outerStaticInfluences?: InfluenceParameters[];
  outerGradualInfluences?: InfluenceParameters[];
}

interface InteractionParameters {
  id: string | number;
}

class InteractionObject {
  static customs: { [id: string]: typeof InteractionObject };

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
  protected inner_static_influences: Influence[];
  protected inner_gradual_influences: GradualInfluence[];
  protected outer_static_influences: Influence[];
  protected outer_gradual_influences: GradualInfluence[];

  initialize(
    config: InteractionConfig,
    parameters: InteractionParameters,
    ...options: any
  ) {
    this.config = config;
    this.parameters = parameters;
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
    this.initialize_influences(config, ...options);
  }

  protected initialize_influences(
    config: InteractionConfig,
    ...options: any
  ) {
    const {
      innerStaticInfluences = [],
      innerGradualInfluences = [],
      outerStaticInfluences = [],
      outerGradualInfluences = []
    } = config;
    for (const parameters of innerStaticInfluences) {
      const influence = new Influence(parameters);
      this.inner_static_influences.push(influence);
    }
    for (const parameters of innerGradualInfluences) {
      const influence = new GradualInfluence(parameters);
      this.inner_gradual_influences.push(influence);
    }
    for (const parameters of outerStaticInfluences) {
      const influence = new Influence(parameters);
      this.outer_static_influences.push(influence);
    }
    for (const parameters of outerGradualInfluences) {
      const influence = new GradualInfluence(parameters);
      this.outer_gradual_influences.push(influence);
    }
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

export {
  InteractResult,
  InteractionConfig,
  InteractionParameters,
  InteractionObject
}
