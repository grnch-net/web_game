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

  override moveStop(): void {
    super.moveStop();
    GAME.userMove();
  }

  userMoveUpdate(): void {
    const { position } = this.data;
    let needStop = this.checkMoveProgress(position, this.direction);
    
    if (needStop) {
      this.moveStop();
      return;
    }

    if (this.data.forcePercent === 0) {
      this.data.forcePercent = 1;
      this.moveStart();
    }

    GAME.userMove();
  }

  userMoveTo(
    position: PointParameters,
    length: number
  ): void {
    this.moveTo(position, length);
    GAME.userMoveTo(position);
  }

}

export {
  UserGameObject
};