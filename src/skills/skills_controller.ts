import { Skill } from './skill';
import { Impact, InteractResult } from '../interactions/index';

export class Controller {
  list: ({ [id: string]: Skill });
  using: Skill;
  recoveries: Skill[];

  initialize(
    ...options: any
  ) {
    this.list = {};
    this.recoveries = [];
  }


  add(
    skill: Skill
  ): boolean {
    if (this.list[skill.id]) {
      console.error('Skill already exists', skill.id);
      return false;
    }
    this.list[skill.id] = skill;
    return true;
  }

  remove(
    skill: Skill
  ): boolean {
    if (!this.list[skill.id]) {
      console.error('Skill already exists', skill.id);
      return false;
    }
    delete this.list[skill.id]
    return true;
  }

  tick(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.tick_recoveries(dt);
    this.tick_using(dt, innerImpact, outerImpact);
  }

  protected tick_recoveries(
    dt: number
  ) {
    const next_list: Skill[] = [];
    for (const skill of this.recoveries) {
      skill.tickRecovery(dt);
      if (skill.recoveryTime > 0) {
        next_list.push(skill);
      } else {
        skill.reset();
      }
    }
    this.recoveries = next_list;
  }

  protected tick_using(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (!this.using) return;
    this.using.tick(dt, innerImpact, outerImpact);
    if (this.using.ended) {
      this.add_to_recovery(this.using);
      this.using = null;
    }
  }

  onOuterImpact(
    impact: Impact
  ): InteractResult {
    if (!this.using) return;
    let result: InteractResult;
    if (this.using.castTime && impact.rules.stun) {
      this.cancelUse();
    } else
    if (this.using.usageTime) {
      result = this.using.onOuterImpact(impact);
      impact.rules.stun && this.cancelUse();
    }
    return result;
  }

  getToUse(
    id: string | number
  ): Skill {
    const skill = this.list[id];
    if (!skill) {
      console.error(`Skill "${id}" is undefined.`);
      return null;
    }
    if (this.using == skill && !skill.reusable) {
      console.error(`Skill "${id}" used.`);
      return null;
    }
    const is_recovering = this.recoveries.includes(skill);
    if (is_recovering) {
      console.info(`Skill recovery: ${skill.recoveryTime}.`);
      return null;
    }
    return skill;
  }

  use(
    skill: Skill,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (this.using) {
      if (!this.using.reusable || this.using != skill) {
        this.cancelUse();
      }
    }
    skill.use(innerImpact, outerImpact);
    this.using = skill;
  }

  cancelUse() {
    if (!this.using) return;
    if (this.using.castTime > 0) {
      this.using.reset();
    } else {
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
    } else {
      skill.reset();
    }
  }

  interactResult(
    result: InteractResult
  ) {
    this.using && this.using.interactResult(result);
  }
}
