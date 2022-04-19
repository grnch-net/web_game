import {
  World
} from './world/index';

import {
  Character,
  CharacterParameters
} from './characters/character';

class Mechanic {

  protected open_world: World;

  initialize(): Mechanic {
    this.initialize_vars();
    return this;
  }

  protected initialize_vars(): void {
    
  }

  createCharacterConfig(
    characterName: string
  ): CharacterParameters {
    return Character.createParameters(characterName);
  }

}

export {
  Mechanic
};