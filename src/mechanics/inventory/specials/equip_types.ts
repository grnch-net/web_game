import type { RangeParameters } from '../../utils';
import type {
  InventoryObjectConfig, InventoryObjectParameters
} from '../inventory_object';


export enum EquipSlot {
  MainHand = 'MainHand',
  SecondHand = 'SecondHand',
  Head = 'Head',
  Body = 'Body',
  Bag = 'Bag'
}

export enum EquipType {
  OneHand = 'OneHand',
  SecondHand = 'SecondHand',
  TwoHand = 'TwoHand',
  LightArmor = 'LightArmor',
  MediumArmor = 'MediumArmor',
  HeavyArmor = 'HeavyArmor'
}

export interface EquipStats {
  penetration?: number;
  damage?: number;
  range?: number;
  block?: number;
  speed?: number;
  armor?: number;
  slots?: number;
}

export interface EquipConfig extends InventoryObjectConfig {
  slot: EquipSlot | EquipSlot[];
  type?: EquipType;
  durability: RangeParameters;
  stats?: EquipStats;
}

export interface EquipParameters extends InventoryObjectParameters {
  durability: RangeParameters;
  stats?: EquipStats;
}
