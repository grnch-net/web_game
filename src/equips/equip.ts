import * as utils from '../utils';
import {
  InteractionObject, InteractionParameters
} from '../interactions/index';

export enum EquipType {
  OneHand,
  SecondHand,
  TwoHand,
  Head,
  Body,
  Bag
}

interface EquipStats {
  penetration?: number;
  damage?: number;
  range?: number;
  block?: number;
  speed?: number;
  armor?: number;
  slots?: number;
}

export interface EquipConfig extends InteractionParameters {
  specialClass?: string;
  type: EquipType;
  name: string;
  durability: utils.RangeArguments;
  stats?: EquipStats;
}

export interface EquipParameters {
  id: string | number;
  durability: utils.RangeArguments;
  stats?: EquipStats;
}

export class Equip extends InteractionObject {
  type: EquipType;
  durability: utils.Range;
  stats: EquipStats;

  initialize(
    config: EquipConfig,
    parameters: EquipParameters
  ) {
    super.initialize(config);
    this.type = config.type;
    this.initialize_durability(config.durability, parameters.durability);
    this.initialize_stats(config.stats, parameters.stats);
  }

  protected initialize_durability(
    config: utils.RangeArguments,
    parameters: utils.RangeArguments
  ) {
    const range = { ...config, ...parameters };
    const { max, value, min } = range;
    this.durability = new utils.Range(max, value, min);
  }

  protected initialize_stats(
    config: any = {},
    parameters: any = {}
  ) {
    this.stats = { ...config, ...parameters };
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
