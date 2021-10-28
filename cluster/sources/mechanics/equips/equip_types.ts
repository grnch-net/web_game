import type {
  InteractionConfig,
  InteractionParameters
} from '../interactions/index';

import {
  EquipSubType
} from '../configs/equips_config';

interface EquipStats {
  durability?: number;
  rangePenetration?: number;
  rangeDamage?: number;
  meleePenetration?: number;
  meleeDamage?: number;
  range?: number;
  sector?: number;
  defense?: number;
  parry?: number;
  speed?: number;
  block?: number;
  armor?: number;
}

interface EquipConfig extends InteractionConfig {
  specialClass?: string;
  slot: number | string;
  size?: number;
  subType?: EquipSubType;
  stats?: EquipStats;
}

interface EquipParameters extends InteractionParameters {
  durability?: number;
}

export {
  EquipStats,
  EquipConfig,
  EquipParameters
}
