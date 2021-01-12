import {
  InteractionObject,
  InteractionConfig,
  InteractionParameters,
  Influence,
  GradualInfluence,
  InfluenceList,
  Impact,
  InteractResult
} from '../interactions/index';

import type {
  Equip,
  EquipSlot
} from '../equips/index';

import {
  skillsConfig
} from '../configs/skills_config';

interface SkillConfig extends InteractionConfig {
  specialClass?: string;
  useCount?: number;
  castTime?: number;
  usageTime?: number;
  recoveryTime?: number;
  stock?: InfluenceList,
  cost?: InfluenceList,
  gradualCost?: InfluenceList,
  needs?: SkillNeeds;
  reusable?: boolean;
}

interface SkillParameters extends InteractionParameters {
  id: string | number;
  useCount?: number;
  recoveryTime?: number;
  experience?: number;
}

interface SkillNeeds {
  equips?: EquipSlot[];
}

interface SkillNeedsResult {
  equips?: Equip[];
}

interface SkillCustomize {
  customs: Associative<typeof Skill>;
  configs: Associative<Skill>;

  AddCustomClass(
    id: string,
    custom: typeof Skill
  ): void;

  findConfig(
    id: string
  ): SkillConfig;

  findSpecialClass(
    specialId: string
  ): typeof Skill;

  create(
    parameters: SkillParameters,
    id?: string | number
  ): Skill;
}

type Customize = typeof InteractionObject & SkillCustomize;

@UTILS.customize(skillsConfig)
@UTILS.modifiable
class Skill extends (InteractionObject as Customize) {

  static multiplyEfficiency = 0.001;

  castTime: number;
  usageTime: number;
  stock: Influence | null;
  cost: Influence | null;
  gradualCost: GradualInfluence | null;
  protected config: SkillConfig;
  protected parameters: SkillParameters;
  protected _ended: boolean;

  get ended(): boolean {
    return this._ended;
  }

  get id(): string | number {
    return this.parameters.id;
  }

  get recoveryTime(): number {
    return this.parameters.recoveryTime;
  }

  get name(): string {
    return this.config.name;
  }

  get needs(): SkillNeeds {
    return this.get_needs();
  }

  get reusable(): boolean {
    return this.config.reusable || false;
  }

  initialize(
    config: SkillConfig,
    parameters: SkillParameters
  ) {
    super.initialize(config, parameters);
    this.initialize_influences(config);
  }

  initialize_influences(
    config: SkillConfig
  ) {
    if (config.stock) {
      this.stock = new Influence(config.stock);
    }
    if (config.cost) {
      this.cost = new Influence(config.cost);
    }
    if (config.gradualCost) {
      this.gradualCost = new GradualInfluence(config.gradualCost);
    }
  }

  protected get_needs(): SkillNeeds {
    return this.config.needs || {};
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
      this.on_apply(innerImpact, outerImpact);
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
      this.on_complete(innerImpact, outerImpact);
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

  protected on_apply(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.inner_static_influence.apply(innerImpact.influenced);
    this.outer_static_influence.apply(outerImpact.influenced);
    this.parameters.recoveryTime = this.config.recoveryTime || 0;
  }

  protected on_complete(
    innerImpact: Impact,
    outerImpact: Impact
  ) {}

  checkNeeds(
    result: SkillNeedsResult
  ): boolean {
    return true;
  }

  getStockImpact(): InfluenceList {
    if (!this.stock) return null;
    const influenced: InfluenceList = {};
    this.stock.apply(influenced);
    return influenced;
  }

  getCostImpact(): InfluenceList {
    if (!this.cost) return null;
    const influenced: InfluenceList = {};
    this.cost.apply(influenced);
    return influenced;
  }

  getGradualCostImpact(): InfluenceList {
    if (!this.gradualCost) return null;
    const influenced: InfluenceList = {};
    this.gradualCost.apply(influenced);
    return influenced;
  }

  use(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.update_cast_time();
    if (!this.castTime) {
      this.on_apply(innerImpact, outerImpact);
    }
  }

  protected update_cast_time() {
    this.castTime = 0;
  }

  onCancel() {}

  interactResult(
    result: InteractResult
  ) {}

  protected randomize_chance(
    value: number
  ): number {
    const half = value * 0.5;
    const random = Math.random() * half;
    return half + random;
  }

}

export {
  SkillConfig,
  SkillParameters,
  SkillNeeds,
  SkillNeedsResult,
  Skill
}
