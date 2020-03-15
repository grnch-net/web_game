import { Impact, InteractResult, ImpactSide } from './interactions/index';
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
      const length = author.position.lengthTo(target.position);
      if (length > impact.rules.range) continue;
      const hit = this.check_hit(author, target, impact.rules.sector);
      if (!hit) continue;
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
    if (sector) return angle <= sector;
    return angle <= (Math.PI * 0.25);
  }

  protected calculate_impact_side(
    author: Character,
    target: Character
  ): ImpactSide {
    let rotate = (target.rotation - author.rotation) % (Math.PI * 2);
    if (rotate < 0) rotate += Math.PI * 2;
    const unit = Math.PI * 0.25;
    if (rotate < unit || rotate > (unit * 7)) return ImpactSide.Back;
    if (rotate < (unit * 3)) return ImpactSide.Right;
    if (rotate < (unit * 5)) return ImpactSide.Front;
    return ImpactSide.Left;
  }
}
