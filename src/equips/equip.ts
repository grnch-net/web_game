import * as utils from '../utils';
import * as impact from '../impact_object';

export enum equipType {
  oneHand,
  secondHand,
  twoHand,
  head,
  body,
  bag
}

interface iStats {
  damage?: number;
  block?: number;
  armor?: number;
  slots?: number;
}

export interface iConfig extends impact.iParameters {
  specialClass?: string;
  type: equipType;
  name: string;
  durability: utils.iRangeArguments;
  stats?: iStats;
}

export interface iParameters extends impact.iParameters {
  id: string | number;
  durability: utils.iRangeArguments;
  stats?: iStats;
}

export class Equip extends impact.ImpactObject {
  type: equipType;
  durability: utils.Range;
  stats: iStats;

  constructor(
    config: iConfig,
    parameters: iParameters,
    ...options: any[]
  ) {
    super(config, parameters, ...options);
  }

  protected initialize(
    config: iConfig,
    parameters: iParameters,
    ...options: any[]
  ) {
    super.initialize();
    this.type = config.type;
    this.initialize_durability(config.durability, parameters.durability);
    this.initialize_stats(config.stats, parameters.stats);
  }

  protected initialize_durability(
    config: utils.iRangeArguments,
    parameters: utils.iRangeArguments
  ) {
    const range = { ...config, ...parameters };
    const { max, value, min } = range;
    this.durability = new utils.Range(max, value, min);
  }

  initialize_stats(
    config: any = {},
    parameters: any = {}
  ) {
    this.stats = { ...config, ...parameters };
  }

  protected initialize_influences(
    config: iConfig,
    parameters: iParameters,
  ) {
    super.initialize_influences(config);
    super.initialize_influences(parameters);
  }

  added(
    innerImpact: any
  ) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
  }

  removed(
    innerImpact: any
  ) {
    this.inner_static_influences
    .forEach(influence => influence.cancel(innerImpact));
  }

}
