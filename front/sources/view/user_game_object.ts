import type {
  PointParameters,
  CharacterData
} from '../game';

import {
  GameObject
} from './game_object';

@UTILS.modifiable
class UserGameObject extends GameObject {
  
  override initialize(data: CharacterData): UserGameObject {
    super.initialize(data);
    return this;
  }

  protected override initialize_vars(): void {
    super.initialize_vars();
    this.character_model_path = '#user-character-prefab';
  }

  userMoveUpdate(): void {
    console.log('userMoveUpdate');
  }

  userMoveTo(
    position: PointParameters,
    length: number
  ): void {
    this.moveTo(position, length);    
    const { longitude } = GAME.store.worldConfig;
    GAME.userMoveTo({
      x: position.x,
      y: position.y,
      z: longitude - position.z
    });
  }

}

export {
  UserGameObject
};