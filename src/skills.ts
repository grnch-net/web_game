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
    this.tick_recoveries(dt);
    this.tick_using(dt, innerImpact, outerImpact);
  }

  protected tick_recoveries(dt: number) {
    this.recoveries.filter(skill => {
      skill.tickRecovery(dt);
      if (!skill.recoveryTime) {
        skill.reset();
      }
      return skill.recoveryTime;
    });
  }

  protected tick_using(dt: number, innerImpact: any, outerImpact: any) {
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
    if (this.using) {
      console.info(`Another skill using: ${this.using.name || this.using.constructor.name}.`);
      return null;
    }
    const skill = this.find_by_name(name);
    if (!skill) {
      console.error(`Skill "${name}" is undefined.`);
      return null;
    }
    const is_ready = this.recoveries.includes(skill);
    if (!is_ready) {
      console.info(`Skill recovery: ${skill.recoveryTime}s.`);
      return null;
    }
    const result = skill.use();
    return result;
  }

  protected find_by_name(name: string) {
    const index = this.names.indexOf(name);
    const skill = this.list[index];
    return skill;
  }

  cancel() {
    if (!this.using) {
      return;
    }
    if (!this.using.castTime) {
      this.using.onCancel();
      if (this.using.recoveryTime) {
        this.recoveries.push(this.using)
      }
    }
    this.using = null;
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
        this.on_cast_complete(innerImpact, outerImpact);
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
        this.on_use_complete(innerImpact, outerImpact);
        dt -= this.usageTime;
        this.usageTime = 0;
        this.ended = true;
        this.tickRecovery(dt);
      }
    }
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  tickRecovery(dt: number) {
    if (dt < this.recoveryTime) {
      this.recoveryTime -= dt;
    } else {
      this.recoveryTime = 0;
    }
  }

  protected on_cast_complete(innerImpact: any, outerImpact: any) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
    this.outer_static_influences
    .forEach(influence => influence.apply(outerImpact));
  }

  protected on_use_complete(innerImpact: any, outerImpact: any) {}

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

  onCancel() {

  }
}

class Recreation extends Skill {

}

export const list: any = {
  Recreation
}
