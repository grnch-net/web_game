import { Effect } from '../effects/index';

export type Attribute = 'health' | 'stamina';

export enum ImpactSide {
  Front,
  Right,
  Back,
  Left
}

interface Rules {
  side?: ImpactSide;
  penetration?: number;
  stun?: number;
  range?: number;
  sector?: number;
}

type Influenced = { [key in Attribute]?: number };

export class Impact {
  positive: Influenced = {};
  negative: Influenced = {};
  effects: Effect[] = [];
  rules: Rules = {};
}
