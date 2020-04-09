import {
  Impact,
  InteractionObject
} from '../interactions/index';

import {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters
} from './equip_types'

class Equip extends InteractionObject {
  protected config: EquipConfig;
  protected parameters: EquipParameters;

  get slot(): EquipSlot | EquipSlot[] {
    return this.config.slot;
  }

  get type(): EquipType {
    return this.config.type;
  }

  get durability(): number {
    return this.parameters.durability;
  }

  set durability(value: number) {
    this.parameters.durability = value;
  }

  get stats(): EquipStats {
    return this.config.stats;
  }

  initialize(
    config: EquipConfig,
    parameters: EquipParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_durability(config, parameters);
  }

  protected initialize_durability(
    config: EquipConfig,
    parameters: EquipParameters
  ) {
    parameters.durability = parameters.durability || config.stats.durability;
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

export {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters,
  Equip
}
