import type {
  Impact,
  TargetInteractResult,
  InteractResult
} from '../interactions/index';

import {
  Skill,
  SkillParameters,
  SkillState
} from './skill';

enum SkillResponseCode {
  Success = 0,
  SuccessInstantly = 1,
  Unknow = 2,
  Undefined = 3,
  Cooldown = 4,
  NotEnough = 5
}

class SkillsController {
  list: Associative<Skill>;
  using: Skill;
  protected recoveries: Skill[];

  initialize(
    list: SkillParameters[],
  ) {
    this.list = {};
    this.recoveries = [];
    for (const parameters of list) {
      const skill = Skill.create(parameters);
      this.add(skill);
    }
  }

  add(
    skill: Skill
  ): boolean {
    if (this.list[skill.id]) {
      console.error('Skill already exists', skill.id);
      return false;
    }
    this.list[skill.id] = skill;
    this.add_to_recovery(skill);
    return true;
  }

  remove(
    skill: Skill
  ): boolean {
    if (!this.list[skill.id]) {
      console.error('Skill is undefined', skill.id);
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
    const list = this.recoveries;
    this.recoveries = [];
    for (const skill of list) {
      skill.tickRecovery(dt);
      this.add_to_recovery(skill);
    }
  }

  protected tick_using(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    if (!this.using) return;
    this.using.tick(dt, innerImpact, outerImpact);
    this.check_usage();
  }

  protected check_usage() {
    if (this.using.state == SkillState.Complete) {
      this.add_to_recovery(this.using);
      this.using = null;
    }
  }

  onOuterImpact(
    innerImpact: Impact,
    result: TargetInteractResult
  ) {
    if (!this.using) return;
    if (this.using.state == SkillState.Cast
      && innerImpact.rules.stun
    ) {
      this.cancelUse();
    } else
    if (this.using.state == SkillState.Usage) {
      this.using.onOuterImpact(innerImpact, result);
      if (innerImpact.rules.stun) {
        this.cancelUse();
      } else {
        this.check_usage();
      }
    }
  }

  getToUse(
    id: string
  ): Skill {
    const skill = this.list[id];
    if (!skill) {
      console.error(`Skill "${id}" is undefined.`);
      return null;
    }
    const checked = this.readyToUse(skill);
    return checked ? skill : null;
  }

  readyToUse(
    skill: Skill
  ): boolean {
    if (this.using == skill && !skill.reusable) {
      console.error(`Skill "${skill.id}" used.`);
      return null;
    }
    const is_recovering = this.recoveries.includes(skill);
    if (is_recovering) {
      console.info(`Skill recovery: ${skill.recoveryTime}.`);
      return null;
    }
    return true;
  }

  use(
    skill: Skill,
    innerImpact: Impact,
    outerImpact: Impact
  ): void {
    if (this.using) {
      if (!this.using.reusable || this.using != skill) {
        this.cancelUse();
      }
    }
    skill.use(innerImpact, outerImpact);
    this.using = skill;
  }

  cancelUse(): SkillResponseCode {
    if (!this.using) {
      return SkillResponseCode.Undefined;
    }
    if (this.using.state == SkillState.Cast) {
      this.using.reset();
    } else {
      this.using.onCancel();
      this.add_to_recovery(this.using);
    }
    this.using = null;
    return SkillResponseCode.Success;
  }

  protected add_to_recovery(
    skill: Skill
  ) {
    if (skill.recoveryTime) {
      skill.onRecovery();
      this.recoveries.push(skill);
    } else {
      skill.reset();
    }
  }

  addToRecovery(
    skill: Skill
  ) {
    this.add_to_recovery(skill);
  }

  interactResult(
    results: InteractResult
  ) {
    if (!results.skill) {
      return;
    }
    this.list[results.skill].interactResult(results);
  }
}

export {
  SkillsController,
  SkillResponseCode
}
