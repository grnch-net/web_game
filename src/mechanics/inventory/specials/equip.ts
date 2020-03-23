import {
  EquipConfig, EquipParameters, EquipSlot, EquipType, EquipStats
} from './equip_types'
import { Range, RangeParameters } from '../../utils';
import { Impact } from '../../interactions/index';
import { InventoryObject } from '../inventory_object';

export class Equip extends InventoryObject {
  durability: Range;
  stats: EquipStats;
  protected config: EquipConfig;
  protected parameters: EquipParameters;

  get slot(): EquipSlot | EquipSlot[] {
    return this.config.slot;
  }

  get type(): EquipType {
    return this.config.type;
  }

  initialize(
    config: EquipConfig,
    parameters: EquipParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_durability(config.durability, parameters.durability);
    this.initialize_stats(config.stats, parameters.stats);
  }

  protected initialize_durability(
    config: RangeParameters,
    parameters: RangeParameters
  ) {
    this.durability = new Range(config, parameters);
  }

  protected initialize_stats(
    config: EquipStats = {},
    parameters: EquipStats = {}
  ) {
    this.stats = { ...config, ...parameters };
  }

  added(
    innerImpact: Impact
  ) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
  }

  removed(
    innerImpact: Impact
  ) {
    this.inner_static_influences
    .forEach(influence => influence.cancel(innerImpact));
  }

  onUseSkill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}
}
