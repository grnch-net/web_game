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
  durability?: number;
  penetration?: number;
  damage?: number;
  defense?: number;
  range?: number;
  parry?: number;
  speed?: number;
  block?: number;
  armor?: number;
  slots?: number;
}

interface EquipConfig extends InteractionConfig {
  slot: EquipSlot | EquipSlot[];
  type?: EquipType;
  stats?: EquipStats;
}

interface EquipParameters {
  durability?: number;
}

export {
  EquipSlot,
  EquipType,
  EquipStats,
  EquipConfig,
  EquipParameters
}
