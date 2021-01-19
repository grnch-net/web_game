import type {
  TimePoint,
  Timeline
} from '../timeline';

import type {
  InteractResult
} from './interaction_object';

import type {
  Character
} from '../characters/character';

import {
  Impact,
  ImpactSide,
} from './impact';

class InteractionController {

  protected _characters: Character[];
  protected _timeline: Timeline<Character>;

  initialize(
    characters: Character[],
    timeline: Timeline
  ) {
    this._characters = characters;
    this._timeline = timeline;
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
      this._timeline.addPoint(timer, character);
    }
  }

  protected interact_range(
    author: Character,
    impact: Impact
  ) {
    const results: InteractResult[] = [];
    for (const target of this._characters) {
      if (author == target) continue;
      const distance = author.position.lengthTo(target.position);
      if (distance > impact.rules.range) continue;
      const hit = this.check_hit(author, target, impact.rules.sector);
      if (!hit) continue;
      const target_impact = impact.clone();
      this.apply_range(distance, target_impact);
      target_impact.rules.side = this.calculate_impact_side(author, target);
      const result = target.interact(target_impact);
      results.push(result);
    }
    author.interactResult(results);
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

}

export {
  InteractionController
};
