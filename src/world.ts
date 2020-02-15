import { Impact, InteractResult, ImpactSide } from './interactions/index';
import { Character } from './character';

export class World {
  characters: Character[];

  initialize() {
    this.characters = [];
  }

  addCharacter(character: Character) {
    this.characters.push(character);
    character.world = this;
  }

  interact(
    author: Character,
    impact: Impact
  ): InteractResult {
    if (impact.rules.range) return;
    let result: InteractResult;
    for (const target of this.characters) {
      if (author == target) continue;
      const length = author.position.lengthTo(target.position);
      if (length > impact.rules.range) continue;
      impact.rules.side = this.calculate_impact_side(author, target);
      result = target.interact(impact);
      break;
    }
    return result;
  }

  protected calculate_impact_side(
    author: Character,
    target: Character
  ): ImpactSide {
    const start = author.rotation;
    const end = target.rotation;
    let rotate = (end - start) % (Math.PI * 2);
    if (rotate < 0) rotate += Math.PI * 2;
    let unit = Math.PI * 0.25;
    if (rotate < unit || rotate > (unit * 7)) return ImpactSide.Front;
    if (rotate < (unit * 3)) return ImpactSide.Right;
    if (rotate < (unit * 5)) return ImpactSide.Back;
    return ImpactSide.Left;
  }
}
