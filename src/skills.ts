import * as utils from './utils';
import * as effects from './effects';
import { Influence } from './influences';

export class Controller extends utils.Collection {
  names: string[];
  list: Skill[];
  using: Skill;

  add(skill: Skill): boolean {
    const result = super.add(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      this.names.push(name);
    }
    return result;
  }

  remove(skill: Skill): boolean {
    const result = super.remove(skill);
    if (result) {
      const name = skill.name || skill.constructor.name;
      const index = this.names.indexOf(name);
      this.list.splice(index, 1);
    }
    return result;
  }

  tick(dt: number, impact: any) {
    this.using && this.using.tick(dt, impact);
  }

  onOuterImpact(impact: any) {
    this.using && this.using.onOuterImpact(impact);
  }

  use(name: string): any {
    const index = this.names.indexOf(name);
    const skill = this.list[index];
    if (!skill) {
      return null;
    }

    const innerImpact = {};
    const outerImpact = {};

    return {
      innerImpact,
      outerImpact
    };
  }
}

export class Skill {
  name: string;
  innerInfluences: Influence[];
  outerInfluences: Influence[];

  constructor(...options: any[]) {
    this.initialize(...options);
  }

  protected initialize(...options: any[]) {}

  tick(dt: any, impact: any) {}

  onOuterImpact(impact: any) {}

  use(): any {
    // return {
    //   innerImpact: {},
    //   outerImpact: {},
    //   innerEffects: [],
    //   outerEffects: [],
    //   rules: {}
    // };
  }
}

class Recreation extends Skill {

}

export const list: any = {
  Recreation
}
