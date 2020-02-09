import { Effect } from '../effects/index';


export enum Attributes {
  Health,
  Stamina,
  Weariness
};

interface Rules {
  penetration?: number;
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
