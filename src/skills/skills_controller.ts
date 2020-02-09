import * as utils from '../utils';
import { Skill } from './skill';

export default class Controller extends utils.Collection {
  list: Skill[];
  using: Skill;
  recoveries: Skill[];
  protected id_list: any[];

  add(
    skill: Skill
  ): boolean {
    if (this.id_list.includes(skill.id)) {
      console.error('Skill already exists', skill.id);
      return false;
    }
    const result = super.add(skill);
    result && this.id_list.push(skill.id);
    return result;
  }

  remove(
    skill: Skill
  ): boolean {
    const result = super.remove(skill);
    if (result) {
      const index = this.id_list.indexOf(skill.id);
      this.list.splice(index, 1);
    }
    return result;
  }

  tick(
    dt: number,
    innerImpact: any,
    outerImpact: any
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
    innerImpact: any,
    outerImpact: any
  ) {
    if (!this.using) return;
    this.using.tick(dt, innerImpact, outerImpact);
    if (this.using.ended) {
      this.add_to_recovery(this.using);
      this.using = null;
    }
  }

  onOuterImpact(
    impact: any
  ) {
    this.using && this.using.onOuterImpact(impact);
  }

  getToUse(
    id: string | number
  ): Skill {
    if (this.using) {
      console.info(`Another skill using: ${this.using.id}.`);
      return null;
    }
    const skill = this.find_by_id(id);
    if (!skill) {
      console.error(`Skill "${id}" is undefined.`);
      return null;
    }
    const is_ready = this.recoveries.includes(skill);
    if (!is_ready) {
      console.info(`Skill recovery: ${skill.recoveryTime}.`);
      return null;
    }
    return skill;
  }

  protected find_by_id(
    id: string | number
  ) {
    const index = this.id_list.indexOf(id);
    const skill = this.list[index];
    return skill;
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
}
