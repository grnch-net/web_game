import {
  World
} from './world';

import {
  Character,
  CharacterParameters
} from './characters/character';

class Mechanic {

  world: World;
  protected last_time: number;

  initialize(): void {
    this.initialize_vars();
    this.create_world();
  }

  protected initialize_vars(): void {
    
  }

  protected create_world(): void {
    this.world = new World;
    this.world.initialize();
  }

  destroy(): void {
    // TODO: Destroy world
  }

  createCharacter(
    characterName: string
  ): CharacterParameters {
    const parameters = Character.createParameters(characterName);
    return parameters;
  }

  enterToWorld(
    parameters: CharacterParameters
  ): Character {
    const character = new Character;
    character.initialize(parameters);
    this.world.addCharacter(character);
    return character;
  }

  leaveFromWorld(
    index: number
  ): boolean {
    const success = this.world.removeCharacter(index);
    return success;
  }

  removeCharacter(
    index: number
  ): void {
    this.world.removeCharacter(index);
  }

  startTicker(): void {
    this.last_time = Date.now();
  }

  characterRotate(
    character: Character,
    rotation: number
  ): void {
    character.rotate(rotation);
  }

  characterMoveStart(
    character: Character,
    direction: number
  ): void {
    character.moveStart(direction);
  }

  characterMoveStop(
    character: Character
  ): void {
    character.moveStop();
  }

  characterUseSkill(
    character: Character,
    skillId: number | string
  ): void {
    character.useSkill(skillId);
  }

}

export {
  Mechanic
};