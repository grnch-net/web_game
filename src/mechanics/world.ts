import { Impact, InteractResult, ImpactSide } from './interactions/index';
import { InventoryController } from './inventory/index';
import { Character } from './character';

export class World {
  characters: Character[];

  initialize() {
    this.characters = [];
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
    for (const character of this.characters) {
      const impact = new Impact;
      character.tick(dt, impact);
    }
  }

  interact(
    author: Character,
    impact: Impact
  ): InteractResult {
    let result: InteractResult;
    for (const target of this.characters) {
      if (author == target) continue;
      const distance = author.position.lengthTo(target.position);
      if (distance > impact.rules.range) continue;
      const hit = this.check_hit(author, target, impact.rules.sector);
      if (!hit) continue;
      this.apply_range(distance, impact);
      impact.rules.side = this.calculate_impact_side(author, target);
      result = target.interact(impact);
      break;
    }
    return result;
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
  ): boolean {
    if (distance < 2) return true;
    impact.rules.penetration -= distance;
  }

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
    // TODO: need world items container extends world_object
    const container = new InventoryController;
    container.initialize(Infinity);
    return container;
  }
}
