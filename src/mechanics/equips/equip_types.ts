import type {
  InteractionConfig,
  InteractionParameters
} from '../interactions/index';

enum EquipSlot {
  Hold,
  Head,
  Body,
  Bag
}

enum EquipType {
  OneHand,
  TwoHand
}

enum EquipSubType {
  Polearm,
  Sword,
  Shield,
  Bow,
  Arrow,
  Thrown
}

interface EquipStats {
  durability?: number;
  rangePenetration?: number;
  rangeDamage?: number;
  meleePenetration?: number;
  meleeDamage?: number;
  range?: number;
  defense?: number;
  parry?: number;
  speed?: number;
  block?: number;
  armor?: number;
}

interface EquipConfig extends InteractionConfig {
  slot: EquipSlot;
  type?: EquipType;
  subType?: EquipSubType;
  stats?: EquipStats;
}

interface EquipParameters extends InteractionParameters {
  durability?: number;
}

export {
  EquipSlot,
  EquipType,
  EquipSubType,
  EquipStats,
  EquipConfig,
  EquipParameters
}
