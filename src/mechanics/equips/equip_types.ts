import type {
  RangeParameters
} from '../utils';

import type {
  InteractionConfig
} from '../interactions/index';

enum EquipSlot {
  MainHand = 'MainHand',
  SecondHand = 'SecondHand',
  Head = 'Head',
  Body = 'Body',
  Bag = 'Bag'
}

enum EquipType {
  OneHand = 'OneHand',
  SecondHand = 'SecondHand',
  TwoHand = 'TwoHand',
  LightArmor = 'LightArmor',
  MediumArmor = 'MediumArmor',
  HeavyArmor = 'HeavyArmor'
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

interface EquipConfig extends InteractionConfig {
  slot: EquipSlot | EquipSlot[];
  type?: EquipType;
  durability: RangeParameters;
  stats?: EquipStats;
}

interface EquipParameters  {
  durability: RangeParameters;
  stats?: EquipStats;
}

export {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters
}
