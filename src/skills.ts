import { Influence } from './influences';

export class Controller {
  list: Skill[];

  constructor() {
    this.initialize();
  }

  protected initialize(...options: any[]) {
    this.list = [];
  }
}

export class Skill {
  innerInfluences: Influence[];
  outerInfluences: Influence[];

  constructor(...options: any[]) {
    this.initialize(...options);
  }

  protected initialize(...options: any[]) {}
}
