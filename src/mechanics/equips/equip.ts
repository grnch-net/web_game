import {
  Range,
  RangeParameters
} from '../utils';

import type {
  Impact
} from '../interactions/index';

import {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters
} from './equip_types'

import {
  InventoryObjectConfig,
  InventoryObjectParameters,
  InventoryObject
} from '../inventory/index';

class Equip extends InventoryObject {
  durability: Range;
  stats: EquipStats;
  protected equip_config: EquipConfig;

  get slot(): EquipSlot | EquipSlot[] {
    return this.equip_config.slot;
  }

  get type(): EquipType {
    return this.equip_config.type;
  }

  initialize(
    config: InventoryObjectConfig,
    parameters: InventoryObjectParameters
  ) {
    super.initialize(config, parameters);
    this.equip_config = config.equip;
    this.initialize_durability(
      config.equip.durability,
      parameters.equip.durability
    );
    this.initialize_stats(
      config.equip.stats,
      parameters.equip.stats
    );
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

InventoryObject.AddCustomClass('equip', Equip);

export {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters,
  Equip
}
