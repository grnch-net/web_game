import type {
  PointParameters
} from './point';

import type {
  InventoryController
} from './inventories/index';

import {
  TimePoint,
  Timeline
} from './timeline';

import {
  Impact,
  ImpactSide
} from './interactions/index';

import {
  Character
} from './characters/character';

import {
  BoxParameters,
  Box
} from './box';

@UTILS.modifiable
export class World {
  characters: Character[];
  boxes: Box[];
  protected timeline: Timeline;

  initialize() {
    this.characters = [];
    this.boxes = [];
    this.timeline = new Timeline;
  }

  addCharacter(
    character: Character
  ) {
    this.characters.push(character);
    character.world = this;
  }

  tick(
    dt: number
  ) {
    const point = this.timeline.tick(dt);
    let next_dt: number;
    if (point.dt) {
      next_dt = dt - point.dt;
      dt = point.dt;
    }
    this.tick_wait(dt);
    this.tick_characters(point.authors);
    if (next_dt) {
      this.tick(next_dt);
    }
  }

  update() {
    this.tick_characters(this.characters);
  }

  protected tick_wait(
    dt: number
  ) {
    for (const character of this.characters) {
      character.wait += dt;
    }
  }

  protected tick_characters(
    characters: Character[]
  ) {
    if (!characters) {
      return;
    }
    for (const character of characters) {
      character.tick(0);
    }
  }

  action(
    character: Character,
    impact: Impact
  ) {
    if (impact.timers) {
      this.add_timers(character, impact.timers);
    }
    if (impact.rules.range) {
      this.interact_range(character, impact);
    }
  }

  protected add_timers(
    character: Character,
    timers: TimePoint[]
  ) {
    while (timers.length) {
      const timer = timers.pop();
      timer.author = character;
      this.timeline.addPoint(timer);
    }
  }

  protected interact_range(
    author: Character,
    impact: Impact
  ) {
    for (const target of this.characters) {
      if (author == target) continue;
      const distance = author.position.lengthTo(target.position);
      if (distance > impact.rules.range) continue;
      const hit = this.check_hit(author, target, impact.rules.sector);
      if (!hit) continue;
      const target_impact = impact.clone();
      this.apply_range(distance, target_impact);
      target_impact.rules.side = this.calculate_impact_side(author, target);
      const result = target.interact(target_impact);
      author.interactResult(result);
    }
  }

  protected check_hit(
    author: Character,
    target: Character,
    sector?: number
  ): boolean {
    const x = target.position.x - author.position.x;
    const z = target.position.z - author.position.z;
    const sinA = Math.sin(author.rotation);
    const cosA = Math.cos(author.rotation);
    const vx = x * cosA - z * sinA;
    const vz = z * cosA + x * sinA;
    const angle = Math.acos(vz / Math.sqrt(vx ** 2 + vz ** 2));
    if (sector) return angle <= (sector / 2);
    return angle <= (Math.PI * 0.25);
  }

  protected apply_range(
    distance: number,
    impact: Impact
  ) {}

  protected calculate_impact_side(
    author: Character,
    target: Character
  ): ImpactSide {
    let rotate = (target.rotation - author.rotation) % (Math.PI * 2);
    if (rotate < 0) rotate += Math.PI * 2;
    const unit = Math.PI * 0.25;
    rotate += unit;
    if (rotate < (unit * 2)) return ImpactSide.Back;
    if (rotate < (unit * 4)) return ImpactSide.Right;
    if (rotate < (unit * 6)) return ImpactSide.Front;
    return ImpactSide.Left;
  }

  getItemsContainer(
    author: Character
  ): InventoryController {
    let box: Box;
    for (const _box of this.boxes) {
      const distance = _box.position.lengthTo(author.position);
      if (distance > 2) continue;
      box = _box;
      break;
    };
    if (box) return box.inventory;
    box = this.create_box(author.position);
    return box.inventory;
  }

  protected create_box(
    position: PointParameters
  ): Box {
    const parameters: BoxParameters = {
      position: { ...position },
      inventory: []
    };
    const box = new Box;
    box.initialize(parameters);
    this.boxes.push(box);
    return box;
  }
}
