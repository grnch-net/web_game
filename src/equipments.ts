import * as utils from './utils';
import ImpactObject from './impact_object';
import * as effects from './effects/index';
import { Influence, GradualInfluence, attributes } from './influences';

export enum equipSlot {
  mainHand,
  secondHand,
  head,
  body,
  bag
}

export enum equipType {
  oneHand,
  twoHand,
  head,
  body,
  bag
}

export class Controller {
  mainHand: Equip;
  secondHand: Equip;
  head: Equip;
  body: Equip;
  bag: Equip;

  constructor() {}

  add(
    equip: Equip,
    innerImpact: any
  ): boolean {
    if (equip.type == equipType.oneHand) {
      if (!this.mainHand) {
        this.mainHand = equip;
      } else
      if (!this.secondHand
        && !(this.mainHand.type == equipType.twoHand)
      ) {
        this.secondHand = equip;
      } else {
        this.remove(equipSlot.mainHand, innerImpact);
        this.mainHand = equip;
      }
    } else
    if (equip.type == equipType.twoHand) {
      this.remove(equipSlot.mainHand, innerImpact);
      this.remove(equipSlot.secondHand, innerImpact);
      this.mainHand = equip;
    } else
    if (equip.type == equipType.head) {
      this.remove(equipSlot.head, innerImpact);
      this.head = equip;
    } else
    if (equip.type == equipType.body) {
      this.remove(equipSlot.body, innerImpact);
      this.body = equip;
    } else
    if (equip.type == equipType.bag) {
      this.remove(equipSlot.bag, innerImpact);
      this.bag = equip;
    } else {
      return false;
    }
    return true;
  }

  remove(
    slot: equipSlot,
    innerImpact: any
  ): boolean {
    let equip: Equip;
    if (slot == equipSlot.mainHand) {
      equip = this.mainHand;
      this.mainHand = null;
    } else
    if (slot == equipSlot.secondHand) {
      equip = this.secondHand;
      this.secondHand = null;
    } else
    if (slot == equipSlot.head) {
      equip = this.head;
      this.head = null;
    } else
    if (slot == equipSlot.body) {
      equip = this.body;
      this.body = null;
    } else
    if (slot == equipSlot.bag) {
      equip = this.bag;
      this.bag = null;
    }
    if (!equip) return false;
    equip.removed(innerImpact);
    return true;
  }

}

export class Equip extends ImpactObject {
  type: equipType;
  durability: utils.Range;

  constructor(
    config: any,
    parameters: any,
    ...options: any[]
  ) {
    super(config, parameters, ...options);
  }

  protected initialize(
    config: any,
    parameters: any,
    ...options: any[]
  ) {
    super.initialize();
    this.type = config.type;
    this.initialize_durability(config.durability, parameters.durability);
  }

  initialize_durability(
    max: number = 100,
    value: number
  ) {
    this.durability = new utils.Range(max, value);
  }

  added(
    innerImpact: any
  ) {
    this.inner_static_influences
    .forEach(influence => influence.apply(innerImpact));
  }

  removed(
    innerImpact: any
  ) {
    this.inner_static_influences
    .forEach(influence => influence.cancel(innerImpact));
  }

}

const configs: any = [
  {
    name: 'Short sword',
    type: equipType.oneHand,
    durability: 100
  },
  {
    name: 'Small shield',
    type: equipType.oneHand,
    durability: 30
  },
  {
    name: 'Wooden staf',
    type: equipType.twoHand,
    durability: 70
  },
  {
    name: 'Iron helmet',
    type: equipType.head,
    durability: 10
  },
  {
    name: 'Leather armor',
    type: equipType.body,
    durability: 20
  },
  {
    name: 'Backpack',
    type: equipType.bag
  }
];


export function findConfig(id: number): any {
  const config = configs[id];
  !config && console.error('Can not find equip config with id:', id);
  return config;
}
