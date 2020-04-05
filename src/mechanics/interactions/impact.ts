// import type {
//   Effect
// } from '../effects/index';

type Attribute = 'health' | 'stamina';
// enum Attribute {
//   health,
//   stamina
// }

enum ImpactSide {
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

class Impact {
  positive: Influenced = {};
  negative: Influenced = {};
  // effects: Effect[] = [];
  rules: Rules = {};
}

export {
  Attribute,
  ImpactSide,
  Impact
}
