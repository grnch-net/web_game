import type {
  PointParameters
} from './point';

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

  characterMoveProgress(
    character: Character,
    position?: PointParameters,
    direction?: number,
    forcePercent?: number
  ): void {
    character.moveProgress(forcePercent, direction, position);
  }

  characterMoveStop(
    character: Character,
    position: PointParameters
  ): void {
    character.moveStop(position);
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