import {
  Impact,
  InteractionObject
} from '../interactions/index';

import {
  EquipStats,
  EquipConfig,
  EquipParameters
} from './equip_types'

import {
  equipsConfig,
  EquipSubType
} from '../configs/equips_config';

interface EquipCustomize {
  customs: Associative<typeof Equip>;
  configs: Associative<Equip>;

  AddCustomClass(
    id: string,
    custom: typeof Equip
  ): void;

  findConfig(
    id: string
  ): EquipConfig;

  findSpecialClass(
    specialId: string
  ): typeof Equip;

  create(
    parameters: EquipParameters,
    config: string | number | EquipConfig
  ): Equip;
}

type Customize = typeof InteractionObject & EquipCustomize;

@UTILS.customize(equipsConfig)
class Equip extends (InteractionObject as Customize) {

  protected config: EquipConfig;
  protected parameters: EquipParameters;

  get slot(): number | string {
    return this.config.slot;
  }

  get size(): number {
    return this.config.size || 1;
  }

  get subType(): EquipSubType {
    return this.config.subType
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
    parameters.durability = parameters.durability || config.stats?.durability;
  }

  added(
    innerImpact: Impact
  ) {
    this.inner_static_influence.apply(innerImpact.influenced);
  }

  removed(
    innerImpact: Impact
  ) {
    this.inner_static_influence.cancel(innerImpact.influenced);
  }

  onUseSkill(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}

}

export {
  EquipStats,
  EquipConfig,
  EquipParameters,
  Equip
};
