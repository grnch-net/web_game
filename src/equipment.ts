import * as utils from './utils';
import ImpactObject from './impact_object';
import * as effects from './effects';
import { Influence, GradualInfluence, attributes } from './influences';

export enum equipSlot {
  mainHand,
  secondHand,
  head,
  body,
  bag
}

export class Controller {
  mainHand: OneHandItem | TwoHandItem;
  secondHand: OneHandItem;
  head: HeadItem;
  body: BodyItem;
  bag: BagItem;

  constructor() {}

  add(
    item: Equip,
    impact: any
  ): boolean {
    if (item instanceof OneHandItem) {
      if (!this.mainHand) {

      } else
      if (!this.secondHand) {

      } else {
        this.remove(equipSlot.mainHand, impact);

      }
    } else
    if (item instanceof TwoHandItem) {
      this.remove(equipSlot.mainHand, impact);
      this.remove(equipSlot.secondHand, impact);

    } else
    if (item instanceof HeadItem) {
      this.remove(equipSlot.head, impact);

    } else
    if (item instanceof BodyItem) {
      this.remove(equipSlot.body, impact);

    } else
    if (item instanceof BagItem) {
      this.remove(equipSlot.bag, impact);

    } else {
      return false;
    }
    return true;
  }

  remove(
    slot: equipSlot,
    impact: any
  ): boolean {
    if (slot == equipSlot.mainHand && this.mainHand) {

    } else
    if (slot == equipSlot.secondHand && this.secondHand) {

    } else
    if (slot == equipSlot.head && this.head) {

    } else
    if (slot == equipSlot.body && this.body) {

    } else
    if (slot == equipSlot.bag && this.bag) {

    } else {
      return false;
    }
    return true;
  }

}

export abstract class Equip extends ImpactObject {

  protected initialize(
    ...options: any[]
  ) {
    super.initialize();
  }

}

export class OneHandItem extends Equip {}
export class TwoHandItem extends Equip {}
export class HeadItem extends Equip {}
export class BodyItem extends Equip {}
export class BagItem extends Equip {}
