import * as utils from './utils';
import * as effects from './effects';
import { Influence, GradualInfluence, attributes } from './influences';

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
    if (!this.using) return;
    this.using.tick(dt, innerImpact, outerImpact);
    if (this.using.ended) {
      if (this.using.recoveryTime) {
        this.recoveries.push(this.using);
      }
      this.using = null;
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
      console.info(`Skill recovery: ${skill.recoveryTime}.`);
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
    if (!this.using) return;
    if (!this.using.castTime) {
      this.using.onCancel();
      if (this.using.recoveryTime) {
        this.recoveries.push(this.using);
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
    this.reset();
    this.initialize_influence(...options);
  }

  protected initialize(...options: any[]) {
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
  }

  protected initialize_influence(...options: any[]) {}

  reset(...options: any[]) {
    this.castTime = 0;
    this.usageTime = 0;
    this.recoveryTime = 0;
    this.ended = false;
  }

  tick(dt: any, innerImpact: any, outerImpact: any): any {
    if (this.castTime > 0) {
      return this.tick_cast(dt, innerImpact, outerImpact);
    } else
    if (this.usageTime > 0) {
      return this.tick_usage(dt, innerImpact, outerImpact);
    }
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  protected tick_cast(dt: any, innerImpact: any, outerImpact: any): any {
    if (dt < this.castTime) {
      this.castTime -= dt;
    } else {
      this.on_cast_complete(innerImpact, outerImpact);
      dt -= this.castTime;
      this.castTime = 0;
      this.tick(dt, innerImpact, outerImpact);
    }
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  protected tick_usage(dt: any, innerImpact: any, outerImpact: any): any {
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

  protected add_inner_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.inner_static_influences.push(influence);
  }

  protected add_inner_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.inner_gradual_influences.push(influence);
  }

  protected add_outer_static_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new Influence();
    influence.set(attribute, value);
    this.outer_static_influences.push(influence);
  }

  protected add_outer_gradual_influence(
    attribute: attributes,
    value: number
  ) {
    const influence = new GradualInfluence();
    influence.set(attribute, value);
    this.outer_gradual_influences.push(influence);
  }
}

const config = {
  Recreation: {
    health: -0.003,
    weariness: -0.003
  }
};

class Recreation extends Skill {
  constructor() {
    super();
  }

  reset() {
    super.reset();
    this.usageTime = Infinity;
  }

  protected initialize_influence() {
    const health = config.Recreation.health;
    this.add_inner_gradual_influence(attributes.healthValue, health);
    const weariness = config.Recreation.weariness;
    this.add_inner_gradual_influence(attributes.wearinessValue, weariness);
  }

}

export const list: any = {
  Recreation
}
