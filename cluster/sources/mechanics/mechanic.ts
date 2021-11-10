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

  createCharacter(
    characterName: string
  ): CharacterParameters {
    const parameters = Character.createParameters(characterName);
    return parameters;
  }

  enterToWorld(
    parameters: CharacterParameters
  ): number {
    const character = new Character;
    character.initialize(parameters);
    const index = this.world.addCharacter(character);
    return index;
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

  characterMove(
    index: number,
    x: number,
    y: number,
    z: number,
    rotatioin: number
  ): void {
    const character = this.world.getCharacter(index);
    character.position.set(x, y, z);
    character.rotation = rotatioin;
  }

  characterUseSkill(
    index: number,
    skillId: number | string
  ): void {
    const character = this.world.getCharacter(index);
    character.useSkill(skillId);
  }

}

export {
  Mechanic
};