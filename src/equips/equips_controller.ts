import { Equip, EquipType } from './equip';

export enum EquipSlot {
  MainHand,
  SecondHand,
  Head,
  Body,
  Bag
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
    if (equip.type == EquipType.OneHand) {
      if (!this.mainHand) {
        this.mainHand = equip;
      } else
      if (!this.secondHand
        && !(this.mainHand.type == EquipType.TwoHand)
      ) {
        this.secondHand = equip;
      } else {
        this.remove(EquipSlot.MainHand, innerImpact);
        this.mainHand = equip;
      }
    } else
    if (equip.type == EquipType.TwoHand) {
      this.remove(EquipSlot.MainHand, innerImpact);
      this.remove(EquipSlot.SecondHand, innerImpact);
      this.mainHand = equip;
    } else
    if (equip.type == EquipType.Head) {
      this.remove(EquipSlot.Head, innerImpact);
      this.head = equip;
    } else
    if (equip.type == EquipType.Body) {
      this.remove(EquipSlot.Body, innerImpact);
      this.body = equip;
    } else
    if (equip.type == EquipType.Bag) {
      this.remove(EquipSlot.Bag, innerImpact);
      this.bag = equip;
    } else {
      console.error(
        'No handler for equipment type.',
        equip.type,
        EquipType[equip.type]
      );
      return false;
    }
    return true;
  }

  remove(
    slot: EquipSlot,
    innerImpact: any
  ): boolean {
    let equip: Equip;
    if (slot == EquipSlot.MainHand) {
      equip = this.mainHand;
      this.mainHand = null;
    } else
    if (slot == EquipSlot.SecondHand) {
      equip = this.secondHand;
      this.secondHand = null;
    } else
    if (slot == EquipSlot.Head) {
      equip = this.head;
      this.head = null;
    } else
    if (slot == EquipSlot.Body) {
      equip = this.body;
      this.body = null;
    } else
    if (slot == EquipSlot.Bag) {
      equip = this.bag;
      this.bag = null;
    } else {
      console.error(
        'No handler for equipment slot.',
        slot,
        EquipSlot[slot]
      );
    }
    if (!equip) return false;
    equip.removed(innerImpact);
    return true;
  }

  getSlot(slot: EquipSlot): Equip {
    if (slot == EquipSlot.MainHand) {
      return this.mainHand;
    } else
    if (slot == EquipSlot.SecondHand) {
      return this.secondHand;
    } else
    if (slot == EquipSlot.Head) {
      return this.head;
    } else
    if (slot == EquipSlot.Body) {
      return this.body;
    } else
    if (slot == EquipSlot.Bag) {
      return this.bag;
    } else {
      console.error(
        'No handler for equipment slot.',
        slot,
        EquipSlot[slot]
      );
    }
  }

}
