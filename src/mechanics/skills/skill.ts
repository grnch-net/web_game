import {
  InteractionObject,
  InteractionConfig,
  InteractionParameters,
  Influence,
  GradualInfluence,
  InfluenceParameters,
  Impact,
  InteractResult
} from '../interactions/index';

import type {
  Equip,
  EquipSlot
} from '../equips/index';

interface SkillConfig extends InteractionConfig {
  castTime?: number;
  usageTime?: number;
  recoveryTime?: number;
  stock?: InfluenceParameters[],
  cost?: InfluenceParameters[],
  gradualCost?: InfluenceParameters[],
  needs?: SkillNeeds;
  reusable?: boolean;
}

interface SkillParameters extends InteractionParameters {
  experience?: number;
  recoveryTime?: number;
}

interface SkillNeeds {
  equips: EquipSlot[];
}

interface SkillNeedsResult {
  equips: Equip[];
}

@UTILS.modifiable
class Skill extends InteractionObject {
  static multiplyEfficiency = 0.001;

  castTime: number;
  usageTime: number;
  stock: Influence[];
  cost: Influence[];
  gradualCost: GradualInfluence[];
  protected config: SkillConfig;
  protected parameters: SkillParameters;
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

  get recoveryTime(): number {
    return this.parameters.recoveryTime;
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
    super.initialize(config, parameters);
    this.initialize_stock(config.stock);
    this.initialize_cost(config.cost);
    this.initialize_gradual_cost(config.gradualCost);
  }

  protected initialize_stock(
    list: InfluenceParameters[]
  ) {
    if (!list) return;
    this.stock = [];
    for (const parameters of list) {
      parameters.negative = true;
      const influence = new Influence(parameters);
      this.stock.push(influence);
    }
  }

  protected initialize_cost(
    list: InfluenceParameters[]
  ) {
    if (!list) return;
    this.cost = [];
    for (const parameters of list) {
      parameters.negative = true;
      const influence = new Influence(parameters);
      this.cost.push(influence);
    }
  }

  protected initialize_gradual_cost(
    list: InfluenceParameters[]
  ) {
    if (!list) return;
    this.gradualCost = [];
    for (const parameters of list) {
      parameters.negative = true;
      const influence = new GradualInfluence(parameters);
      this.gradualCost.push(influence);
    }
  }

  reset() {
    this.castTime = this.config.castTime || 0;
    this.usageTime = this.config.usageTime || 0;
    this.parameters.recoveryTime = 0;
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
      this.parameters.recoveryTime -= dt;
    } else {
      this.parameters.recoveryTime = 0;
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
    this.parameters.recoveryTime = this.config.recoveryTime || 0;
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

export {
  SkillConfig,
  SkillParameters,
  SkillNeeds,
  SkillNeedsResult,
  Skill
}
