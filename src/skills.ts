import * as utils from './utils';
import * as effects from './effects';
import { Influence, GradualInfluence } from './influences';

export class Controller extends utils.Collection {
  names: string[];
  list: Skill[];
  using: Skill;
  recoveries: Skill[];

  add(skill: Skill): boolean {
    const result = super.add(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      this.names.push(name);
    }
    return result;
  }

  remove(skill: Skill): boolean {
    const result = super.remove(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      const index = this.names.indexOf(name);
      this.list.splice(index, 1);
    }
    return result;
  }

  tick(dt: number, innerImpact: any, outerImpact: any) {
    this.recoveries.filter(skill => {
      skill.tick(dt, innerImpact, outerImpact);
      if (!skill.recoveryTime) {
        skill.reset();
      }
      return skill.recoveryTime;
    });
    if (this.using) {
      this.using.tick(dt, innerImpact, outerImpact);
      if (this.using.ended) {
        if (this.using.recoveryTime) {
          this.recoveries.push(this.using)
        }
        this.using = null;
      }
    }
  }

  onOuterImpact(impact: any) {
    this.using && this.using.onOuterImpact(impact);
  }

  use(name: string): any {
    const index = this.names.indexOf(name);
    const skill = this.list[index];
    if (!skill) {
      return null;
    }

    const innerImpact = {};
    const outerImpact = {};

    return {
      innerImpact,
      outerImpact
    };
  }
}

export class Skill {
  name: string;
  castTime: number;
  usageTime: number;
  recoveryTime: number;
  ended: boolean;
  protected inner_static_influences: Influence[];
  protected inner_gradual_influences: GradualInfluence[];
  protected outer_static_influences: Influence[];
  protected outer_gradual_influences: GradualInfluence[];

  constructor(...options: any[]) {
    this.initialize(...options);
  }

  protected initialize(...options: any[]) {
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
    this.reset();
  }

  reset() {
    this.castTime = 0;
    this.usageTime = 0;
    this.recoveryTime = 0;
    this.ended = false;
  }

  tick(dt: any, innerImpact: any, outerImpact: any): any {
    if (this.castTime > 0) {
      if (dt < this.castTime) {
        this.castTime -= dt;
      } else {
        this.on_end_cast(innerImpact, outerImpact);
        dt -= this.castTime;
        this.castTime = 0;
        this.tick(dt, innerImpact, outerImpact);
      }
    } else
    if (this.usageTime > 0) {
      if (dt < this.usageTime) {
        this.usageTime -= dt;
        this.tick_influences(dt, innerImpact, outerImpact);
      } else {
        this.tick_influences(this.usageTime, innerImpact, outerImpact);
        dt -= this.usageTime;
        this.usageTime = 0;
        this.ended = true;
        this.tick(dt, innerImpact, outerImpact);
      }
    } else
    if (this.recoveryTime > 0) {
      if (dt < this.recoveryTime) {
        this.recoveryTime -= dt;
      } else {
        dt = this.recoveryTime;
        this.recoveryTime = 0;
      }
    }
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  protected on_end_cast(innerImpact: any, outerImpact: any) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
    this.outer_static_influences
    .forEach(influence => influence.apply(outerImpact));
  }

  on_end_use(innerImpact: any, outerImpact: any) {}

  protected tick_influences(dt: number, innerImpact: any, outerImpact: any) {
    this.inner_gradual_influences
    .forEach(influence => influence.tick(dt, innerImpact));
    this.outer_gradual_influences
    .forEach(influence => influence.tick(dt, outerImpact));
  }

  onOuterImpact(impact: any): any {}

  use(): any {
    // return {
    //   cost: {},
    //   innerImpact: {},
    //   outerImpact: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  onBreak() {

  }
}

class Recreation extends Skill {

}

export const list: any = {
  Recreation
}
