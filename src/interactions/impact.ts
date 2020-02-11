import { Effect } from '../effects/index';


export enum Attributes {
  Health,
  Stamina,
  Weariness
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
}

type Influenced = {
  [key in Attributes]?: number
};

export class Impact {
  positive: Influenced = {};
  negative: Influenced = {};
  effects: Effect[] = [];
  rules: Rules = {};
}
