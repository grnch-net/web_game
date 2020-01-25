import * as utils from './utils';
import ImpactObject from './impact_object';
// import * as effects from './effects';
import { Influence, GradualInfluence, attributes } from './influences';

export class Controller extends utils.Collection {
  names: string[];
  list: Skill[];
  using: Skill;
  recoveries: Skill[];

  add(
    skill: Skill
  ): boolean {
    const result = super.add(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      this.names.push(name);
    }
    return result;
  }

  remove(
    skill: Skill
  ): boolean {
    const result = super.remove(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      const index = this.names.indexOf(name);
      this.list.splice(index, 1);
    }
    return result;
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ): any {
    this.tick_recoveries(dt);
    return this.tick_using(dt, innerImpact, outerImpact);
  }

  protected tick_recoveries(
    dt: number
  ) {
    this.recoveries.filter(skill => {
      skill.tickRecovery(dt);
      !skill.recoveryTime && skill.reset();
      return skill.recoveryTime;
    });
  }

  protected tick_using(
    dt: number,
    innerImpact: any,
    outerImpact: any
  ): any {
    if (!this.using) return null;
    const result = this.using.tick(dt, innerImpact, outerImpact);
    if (this.using.ended) {
      this.add_to_recovery(this.using);
      this.using = null;
    }
    return result;
  }

  onOuterImpact(
    impact: any
  ) {
    this.using && this.using.onOuterImpact(impact);
  }

  getToUse(
    name: string
  ): Skill {
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
    return skill;
  }

  protected find_by_name(
    name: string
  ) {
    const index = this.names.indexOf(name);
    const skill = this.list[index];
    return skill;
  }

  cancelUse() {
    if (!this.using) return;
    if (!this.using.castTime) {
      this.using.onCancel();
      this.add_to_recovery(this.using);
    }
    this.using = null;
  }

  protected add_to_recovery(
    skill: Skill
  ) {
    if (skill.recoveryTime) {
      this.recoveries.push(skill);
    }
  }
}

export class Skill extends ImpactObject {
  name: string;
  castTime: number;
  usageTime: number;
  recoveryTime: number;
  rules: any;
  cost: any;
  gradualCost: any;
  ended: boolean;

  protected initialize(
    ...options: any[]
  ) {
    this.cost = null;
    this.gradualCost = null;
    this.inner_static_influences = [];
    this.inner_gradual_influences = [];
    this.outer_static_influences = [];
    this.outer_gradual_influences = [];
    this.reset();
  }

  reset(
    ...options: any[]
  ) {
    this.castTime = 0;
    this.usageTime = 0;
    this.recoveryTime = 0;
    this.rules = {};
    this.ended = false;
  }

  tick(
    dt: any,
    innerImpact: any,
    outerImpact: any
  ): any {
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

  protected tick_cast(
    dt: any,
    innerImpact: any,
    outerImpact: any
  ): any {
    if (dt < this.castTime) {
      this.castTime -= dt;
      return {};
    } else {
      this.on_cast_complete(innerImpact, outerImpact);
      dt -= this.castTime;
      this.castTime = 0;
      return this.tick(dt, innerImpact, outerImpact);
    }
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  protected tick_usage(
    dt: any,
    innerImpact: any,
    outerImpact: any
  ): any {
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
    return {};
    // return {
    //   cost: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }

  tickRecovery(
    dt: number
  ) {
    if (dt < this.recoveryTime) {
      this.recoveryTime -= dt;
    } else {
      this.recoveryTime = 0;
    }
  }

  protected on_cast_complete(
    innerImpact: any,
    outerImpact: any
  ) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
    this.outer_static_influences
    .forEach(influence => influence.apply(outerImpact));
  }

  protected on_use_complete(
    innerImpact: any,
    outerImpact: any
  ) {}

  use(): any {
    return {
    //   cost: {},
    //   innerImpact: {},
    //   outerImpact: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    };
  }

  onCancel() {
    // TODO: reset?
  }

}

const config = {
  Recreation: {
    health: -0.003,
    weariness: -0.003
  },
  Attack: {
    castTime: 1,
    health: -10,
    staminaCost: 25
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

  protected initialize_influences() {
    const health = config.Recreation.health;
    this.add_inner_gradual_influence(attributes.health, health);
    const weariness = config.Recreation.weariness;
    this.add_inner_gradual_influence(attributes.weariness, weariness);
  }

}

class Attack extends Skill {
  constructor() {
    super();
  }

  reset() {
    super.reset();
    this.castTime = config.Attack.castTime;
  }

  protected initialize() {
    this.cost = {};
    this.cost[attributes.stamina] = -config.Attack.staminaCost;
  }

  protected initialize_influences() {
    const health = config.Attack.health;
    this.add_outer_static_influence(attributes.health, health);
  }

}

export const list: any = {
  Recreation,
  Attack
}
