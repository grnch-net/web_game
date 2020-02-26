import { Effect } from '../effects/index';


export enum Attributes {
  Health = 'health',
  Stamina = 'stamina'
};

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

type Influenced = { [key in Attributes]?: number };

export class Impact {
  positive: Influenced = {};
  negative: Influenced = {};
  effects: Effect[] = [];
  rules: Rules = {};
}
