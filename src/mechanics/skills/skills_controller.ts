import type {
  Impact,
  InteractResult
} from '../interactions/index';

import type {
  Skill,
  SkillParameters
} from './skill';

import {
  SkillsUtils
} from './skills_utils';

class SkillsController {
  list: { [id: string]: Skill };
  using: Skill;
  protected recoveries: Skill[];

  initialize(
    list: SkillParameters[],
  ) {
    this.list = {};
    this.recoveries = [];
    for (const parameters of list) {
      const skill = SkillsUtils.create(parameters);
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
    if (this.using.ended) {
      this.add_to_recovery(this.using);
      this.using = null;
    }
  }

  onOuterImpact(
    innerImpact: Impact,
    result: InteractResult
  ) {
    if (!this.using) return;
    if (this.using.castTime && innerImpact.rules.stun) {
      this.cancelUse();
    } else
    if (this.using.usageTime) {
      this.using.onOuterImpact(innerImpact, result);
      innerImpact.rules.stun && this.cancelUse();
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

export {
  SkillsController
}
