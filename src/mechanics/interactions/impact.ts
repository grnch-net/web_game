// import type {
//   Effect
// } from '../effects/index';

type Attribute = 'health' | 'stamina';

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

type InfluenceList = { [key in Attribute]?: number };

class Impact {
  influenced: InfluenceList = {};
  // effects: Effect[] = [];
  rules: Rules = {};
}

export {
  Attribute,
  InfluenceList,
  ImpactSide,
  Impact
}
