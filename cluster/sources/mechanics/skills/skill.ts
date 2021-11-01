import {
  TimePoint
} from '../timeline';

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
  Equip
} from '../equips/index';

import {
  EquipSlot
} from '../configs/equips_config';

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
  stats?: any;
}

interface SkillParameters extends InteractionParameters {
  id?: string | number;
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

enum SkillState {
  Ready,
  Cast,
  Usage,
  Complete,
  Recovery
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
    config?: string | number | SkillConfig
  ): Skill;
}

type Customize = typeof InteractionObject & SkillCustomize;

@UTILS.customize(skillsConfig)
@UTILS.modifiable
class Skill extends (InteractionObject as Customize) {

  static multiplyEfficiency = 0.001;

  config: SkillConfig;
  parameters: SkillParameters;
  state: SkillState;
  castTimer: TimePoint;
  usageTimer: TimePoint;
  stock: Influence | null;
  cost: Influence | null;
  gradualCost: GradualInfluence | null;

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
    this.reset_cast_timer();
    this.reset_usage_timer();
    this.state = SkillState.Ready;
  }

  protected reset_cast_timer() {
    if (this.castTimer) {
      this.castTimer.disable();
    }
    const cast_time = this.get_cast_time();
    if (cast_time) {
      this.castTimer = new TimePoint(cast_time);
    }
  }

  protected reset_usage_timer() {
    if (this.usageTimer) {
      this.usageTimer.disable();
    }
    const usage_time = this.get_usage_time();
    if (usage_time) {
      this.usageTimer = new TimePoint(usage_time);
    }
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.state == SkillState.Cast) {
      if (this.castTimer.complete) {
        this.on_apply(innerImpact, outerImpact);
        this.castTimer = null;
      }
    } else
    if (this.state == SkillState.Usage) {
      outerImpact.rules.skill = this.id;
      this.tick_influences(dt, innerImpact, outerImpact);
      if (this.usageTimer.complete) {
        this.on_complete(innerImpact, outerImpact);
      }
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
    outerImpact.rules.skill = this.id;
    this.inner_static_influence.apply(innerImpact.influenced);
    this.outer_static_influence.apply(outerImpact.influenced);
    this.parameters.recoveryTime = this.config.recoveryTime || 0;
    if (this.usageTimer) {
      this.state = SkillState.Usage;
      outerImpact.addTimePoint(this.usageTimer);
    } else {
      this.on_complete(innerImpact, outerImpact);
    }
  }

  protected on_complete(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.state = SkillState.Complete
  }

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
    if (this.castTimer) {
      this.reset(); // update timers with skill needs
      this.state = SkillState.Cast;
      outerImpact.addTimePoint(this.castTimer);
    } else {
      this.on_apply(innerImpact, outerImpact);
    }
  }

  protected get_cast_time(): number {
    return this.config.castTime || 0;
  }

  protected get_usage_time(): number {
    return this.config.usageTime || 0;
  }

  onCancel() {
    this.state = SkillState.Complete;
    this.usageTimer.disable();
    this.usageTimer = null;
  }

  onRecovery() {
    this.state = SkillState.Recovery;
  }

  interactResult(
    results: InteractResult
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
  SkillState,
  Skill
}
