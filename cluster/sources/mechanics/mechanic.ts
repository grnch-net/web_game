import {
  World
} from './world/index';

import {
  Character,
  CharacterParameters
} from './characters/character';

import type {
  ActionListener
} from './interactions/index';

class Mechanic {

  protected open_world: World;

  initialize(): Mechanic {
    this.initialize_vars();
    return this;
  }

  protected initialize_vars(): void {
    
  }

  isCreatedOpenWorld(): boolean {
    return !!this.open_world;
  }

  isFullOpenWorld(): boolean {
    return this.open_world.characters.count < 2;
  }

  createWorld(): void {
    this.open_world = (new World).initialize();
  }

  createCharacterConfig(
    characterName: string
  ): CharacterParameters {
    return Character.createParameters(characterName);
  }

  enterToWorld(
    parameters: CharacterParameters
  ): Character {
    const character = new Character;
    character.initialize(parameters);
    if (!this.open_world) {
      console.log('World not created');
    }
    this.open_world.addCharacter(character);
    return character;
  }

  leaveFromWorld(
    index: number
  ): boolean {
    return this.open_world.removeCharacter(index);
  }

  addActionListener(
    listener: ActionListener
  ): void {
    this.open_world.addActionListener(listener);
  }

  runWorld(): void {
    this.open_world.startTicker();
    this.open_world = null;
  }

}

export {
  Mechanic
};