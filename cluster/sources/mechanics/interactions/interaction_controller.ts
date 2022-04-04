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

  protected _characters: List<Character>;
  protected _timeline: Timeline<Character>;
  protected _tree: QuadTree<Character>;

  initialize(
    characters: List<Character>,
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
    for (const character of this._characters.elements) {
      if (!character) {
        continue;
      }
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
      if (impact.rules.sector) {
        this.interact_sector(character, impact);
      } else {
        this.interact_distance(character, impact);
      }
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

  protected interact_sector(
    author: Character,
    impact: Impact
  ) {
    this.update_tree();
    const targets = this._tree.findByRadius(author.position, impact.rules.range);
    const results: InteractResult = {
      skill: impact.rules.skill,
      targets: []
    };
    for (const target of targets) {
      if (author == target) continue;
      if (impact.rules.sector < Math.PI * 2) {
        const hit = this.check_sector_hit(author, target, impact.rules.sector);
        if (!hit) continue;
      }
      const target_impact = impact.clone();
      // this.apply_range(distance, target_impact);
      target_impact.rules.side = this.calculate_impact_side(author, target);
      const result = target.interact(target_impact);
      results.targets.push(result);
    }
    author.interactResult(results);
  }

  protected check_sector_hit(
    author: Character,
    target: Character,
    sector: number
  ): boolean {
    const rotation = author.getRotation();
    const author_direction = {
      x: -Math.sin(-rotation),
      z: Math.cos(-rotation)
    };
    
    const x = target.position.x - author.position.x;
    const z = target.position.z - author.position.z;
    const sin = author_direction.x;
    const cos = author_direction.z;
    const vx = x * cos - z * sin;
    const vz = z * cos + x * sin;
    const angle = Math.acos(vz / Math.sqrt(vx ** 2 + vz ** 2));
    return angle <= (sector / 2);
  }

  // protected apply_range(
  //   distance: number,
  //   impact: Impact
  // ) {}

  protected calculate_impact_side(
    author: Character,
    target: Character
  ): ImpactSide {
    let rotate = (target.getRotation() - author.getRotation()) % (Math.PI * 2);
    if (rotate < 0) rotate += Math.PI * 2;
    const unit = Math.PI * 0.25;
    rotate += unit;
    if (rotate < (unit * 2)) return ImpactSide.Back;
    if (rotate < (unit * 4)) return ImpactSide.Right;
    if (rotate < (unit * 6)) return ImpactSide.Front;
    return ImpactSide.Left;
  }

  protected interact_distance(
    author: Character,
    impact: Impact
  ) {
    this.update_tree();
    // TODO:
    // this._tree.findByDirection
  }

}

export {
  InteractionController
};
