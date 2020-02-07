import * as impact from '../impact_object';
import {
  Influence, GradualInfluence, iInfluenceArguments
} from '../influences';
import { Equip, equipSlot } from '../equips/index';


export interface iConfig extends impact.iParameters {
  name: string;
  specialClass?: string;
  castTime?: number;
  usageTime?: number;
  recoveryTime?: number;
  stock?: iInfluenceArguments[],
  cost?: iInfluenceArguments[],
  gradualCost?: iInfluenceArguments[],
  rules?: any;
  needs?: { equip: equipSlot; };
}

export interface iParameters {
  id: string | number;
}

export class Skill extends impact.ImpactObject {
  id: string | number;
  config: iConfig;
  castTime: number;
  usageTime: number;
  recoveryTime: number;
  rules: any;
  needs: any;
  stock: Influence[];
  cost: Influence[];
  gradualCost: GradualInfluence[];
  protected _ended: boolean;

  get ended(): boolean {
    return this._ended;
  }

  get name(): string {
    return this.config.name;
  }

  protected initialize(
    config: iConfig,
    parameters: iParameters,
    ...options: any[]
  ) {
    super.initialize();
    this.id = parameters.id;
    this.config = config;
    const {
      stock,
      cost,
      gradualCost,
      rules,
      needs
    } = config;
    this.rules = rules;
    this.needs = needs;
    this.initialize_stock(stock);
    this.initialize_cost(cost);
    this.initialize_gradual_cost(gradualCost);
    this.reset();
  }

  protected initialize_stock(
    list: iInfluenceArguments[]
  ) {
    if (!list) return;
    this.stock = [];
    for (const { attribute, value } of list) {
      const influence = new Influence();
      influence.set(attribute, value);
      this.stock.push(influence);
    }
  }

  protected initialize_cost(
    list: iInfluenceArguments[]
  ) {
    if (!list) return;
    this.cost = [];
    for (const { attribute, value } of list) {
      const influence = new Influence();
      influence.set(attribute, value);
      this.cost.push(influence);
    }
  }

  protected initialize_gradual_cost(
    list: iInfluenceArguments[]
  ) {
    if (!list) return;
    this.gradualCost = [];
    for (const { attribute, value } of list) {
      const influence = new GradualInfluence();
      influence.set(attribute, value);
      this.gradualCost.push(influence);
    }
  }

  reset(
    ...options: any[]
  ) {
    this.castTime = this.config.castTime || 0;
    this.usageTime = this.config.usageTime || 0;
    this.recoveryTime = this.config.recoveryTime || 0;
    this._ended = false;
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
      this._ended = true;
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

  checkNeeds(
    result: ({ equip: Equip })
  ): boolean {
    return true;
  }

  use(): any {
    return {
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
