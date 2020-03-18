import { Range, RangeParameters } from '../utils';
import {
  InteractionObject, InteractionConfig, InteractionParameters, Impact
} from '../interactions/index';

export enum EquipSlot {
  MainHand = 'MainHand',
  SecondHand = 'SecondHand',
  Head = 'Head',
  Body = 'Body',
  Bag = 'Bag'
}

export enum EquipType {
  Weapon = 'Weapon',
  Armor = 'Armor'
}

export enum WeaponType {
  OneHand = 'OneHand',
  SecondHand = 'SecondHand',
  TwoHand = 'TwoHand'
}

export enum ArmorType {
  Light = 'Light',
  Medium = 'Medium',
  Heavy = 'Heavy'
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

export interface EquipConfig extends InteractionConfig {
  slot: EquipSlot | EquipSlot[];
  type?: EquipType;
  subType?: WeaponType | ArmorType;
  name: string;
  durability: RangeParameters;
  stats?: EquipStats;
}

export interface EquipParameters extends InteractionParameters {
  durability: RangeParameters;
  stats?: EquipStats;
}

export class Equip extends InteractionObject {
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
  get subType(): WeaponType | ArmorType {
    return this.config.subType;
  }
  get name(): string {
    return this.config.name;
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
