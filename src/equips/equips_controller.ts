import { Equip, equipType } from './equip';

export enum equipSlot {
  mainHand,
  secondHand,
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
      console.error(
        'No handler for equipment type.',
        equip.type,
        equipType[equip.type]
      );
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
    } else {
      console.error(
        'No handler for equipment slot.',
        slot,
        equipSlot[slot]
      );
    }
    if (!equip) return false;
    equip.removed(innerImpact);
    return true;
  }

  getSlot(slot: equipSlot): Equip {
    if (slot == equipSlot.mainHand) {
      return this.mainHand;
    } else
    if (slot == equipSlot.secondHand) {
      return this.secondHand;
    } else
    if (slot == equipSlot.head) {
      return this.head;
    } else
    if (slot == equipSlot.body) {
      return this.body;
    } else
    if (slot == equipSlot.bag) {
      return this.bag;
    } else {
      console.error(
        'No handler for equipment slot.',
        slot,
        equipSlot[slot]
      );
    }
  }

}
