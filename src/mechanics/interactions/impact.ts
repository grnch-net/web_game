// import type {
//   Effect
// } from '../effects/index';

import {
  TimePoint
} from '../timeline';

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
  timers: TimePoint[] = [];
  influenced: InfluenceList = {};
  // effects: Effect[] = [];
  rules: Rules = {};

  addTimePoint(
    timer: TimePoint
  ) {
    if (timer.value === Infinity) {
      return;
    }
    this.timers.push(timer);
  }

  clone(): Impact {
    const impact = new Impact();
    impact.timers = [ ...this.timers ];
    impact.influenced = { ...this.influenced };
    impact.rules = { ...this.rules };
    return impact;
  }
}

export {
  Attribute,
  InfluenceList,
  ImpactSide,
  Impact
}
