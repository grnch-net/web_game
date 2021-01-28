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

import {
  QuadTree
} from '../quadtree';

class InteractionController {

  protected _characters: Character[];
  protected _timeline: Timeline<Character>;
  protected _tree: QuadTree<Character>;

  initialize(
    characters: Character[],
    timeline: Timeline,
    size: number
  ) {
    this._characters = characters;
    this._timeline = timeline;
    this.initialize_tree(size);
  }

  protected initialize_tree(
    size: number
  ) {
    this._tree = new QuadTree;
    this._tree.initialize(size);
  }

  tick(
    dt: number
  ) {
    this._tree.clear();
  }

  protected update_tree() {
    if (!this._tree.isClear) {
      return;
    }
    for (const character of this._characters) {
      this._tree.insert(character);
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
      this._timeline.addPoint(timer, character);
    }
  }

  protected interact_range(
    author: Character,
    impact: Impact
  ) {
    this.update_tree();
    const targets = this._tree.findByRadius(author.position, impact.rules.range);
    const results: InteractResult[] = [];
    for (const target of targets) {
      if (author == target) continue;
      const hit = this.check_hit(author, target, impact.rules.sector);
      if (!hit) continue;
      const target_impact = impact.clone();
      // this.apply_range(distance, target_impact);
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

  // protected apply_range(
  //   distance: number,
  //   impact: Impact
  // ) {}

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
