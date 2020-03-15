import {
  InteractionObject, InteractionParameters, Influence, GradualInfluence,
  InfluenceArguments, Impact, InteractResult
} from '../interactions/index';
import { Equip, EquipSlot } from '../equips/index';

export interface SkillConfig extends InteractionParameters {
  name: string;
  specialClass?: string;
  castTime?: number;
  usageTime?: number;
  recoveryTime?: number;
  stock?: InfluenceArguments[],
  cost?: InfluenceArguments[],
  gradualCost?: InfluenceArguments[],
  needs?: SkillNeeds;
  reusable?: boolean;
}

export interface SkillParameters {
  id: string | number;
  experience?: number;
}

export interface SkillNeeds {
  equips: EquipSlot[];
}

export interface SkillNeedsResult {
  equips: Equip[];
}


export class Skill extends InteractionObject {
  static multiplyEfficiency = 0.001;
  config: SkillConfig;
  parameters: SkillParameters;
  castTime: number;
  usageTime: number;
  recoveryTime: number;
  stock: Influence[];
  cost: Influence[];
  gradualCost: GradualInfluence[];
  protected _ended: boolean;
  protected equips: Equip[];

  get ended(): boolean {
    return this._ended;
  }

  get id(): string | number {
    return this.parameters.id;
  }

  get experience(): number {
    return this.parameters.experience;
  }

  get name(): string {
    return this.config.name;
  }

  get needs(): SkillNeeds {
    return this.config.needs;
  }

  get reusable(): boolean {
    return this.config.reusable || false;
  }

  initialize(
    config: SkillConfig,
    parameters: SkillParameters
  ) {
    super.initialize(config);
    this.config = config;
    this.parameters = parameters;
    this.initialize_stock(config.stock);
    this.initialize_cost(config.cost);
    this.initialize_gradual_cost(config.gradualCost);
    this.reset();
  }

  protected initialize_stock(
    list: InfluenceArguments[]
  ) {
    if (!list) return;
    this.stock = [];
    for (const { attribute, value } of list) {
      const influence = new Influence();
      influence.set(attribute, value, true);
      this.stock.push(influence);
    }
  }

  protected initialize_cost(
    list: InfluenceArguments[]
  ) {
    if (!list) return;
    this.cost = [];
    for (const { attribute, value } of list) {
      const influence = new Influence();
      influence.set(attribute, value, true);
      this.cost.push(influence);
    }
  }

  protected initialize_gradual_cost(
    list: InfluenceArguments[]
  ) {
    if (!list) return;
    this.gradualCost = [];
    for (const { attribute, value } of list) {
      const influence = new GradualInfluence();
      influence.set(attribute, value, true);
      this.gradualCost.push(influence);
    }
  }

  reset() {
    this.castTime = this.config.castTime || 0;
    this.usageTime = this.config.usageTime || 0;
    this.recoveryTime = this.config.recoveryTime || 0;
    this._ended = false;
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.castTime > 0) {
      this.tick_cast(dt, innerImpact, outerImpact);
    } else {
      this.tick_usage(dt, innerImpact, outerImpact);
    }
  }

  protected tick_cast(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (dt < this.castTime) {
      this.castTime -= dt;
      return null;
    } else {
      this.on_cast_complete(innerImpact, outerImpact);
      dt -= this.castTime;
      this.castTime = 0;
      return this.tick(dt, innerImpact, outerImpact);
    }
  }

  protected tick_usage(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (dt < this.usageTime) {
      this.usageTime -= dt;
      this.tick_influences(dt, innerImpact, outerImpact);
    } else {
      if (this.usageTime) {
        this.tick_influences(this.usageTime, innerImpact, outerImpact);
        dt -= this.usageTime;
        this.usageTime = 0;
      }
      this.on_use_complete(innerImpact, outerImpact);
      this._ended = true;
      this.tickRecovery(dt);
    }
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
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
    this.outer_static_influences
    .forEach(influence => influence.apply(outerImpact));
  }

  protected on_use_complete(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    this.equips = result.equips;
    return true;
  }

  getStockImpact(): Impact {
    if (!this.stock) return null;
    const impact = new Impact;
    for (const influence of this.stock) {
      influence.apply(impact);
    }
    return impact;
  }

  getCostImpact(): Impact {
    if (!this.cost) return null;
    const impact = new Impact;
    for (const influence of this.cost) {
      influence.apply(impact);
    }
    return impact;
  }

  getGradualCostImpact(): Impact {
    if (!this.gradualCost) return null;
    const impact = new Impact;
    for (const influence of this.gradualCost) {
      influence.apply(impact);
    }
    return impact;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (!this.castTime) {
      this.on_cast_complete(innerImpact, outerImpact);
    }
  }

  onCancel() {}

  interactResult(
    result: InteractResult
  ) {}
}
