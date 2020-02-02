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
