import type {
  CharacterData
} from '../game';

import {
  GameObject
} from './game_object';

interface UserDirection {
  front: boolean;
  right: boolean;
  back: boolean;
  left: boolean;
}

class UserGameObject extends GameObject {

  userDirection: UserDirection;

  override create(
    path: string,
    data: CharacterData
  ): UserGameObject {
    super.create(path, data);
    this.userDirection = {
      front: false,
      right: false,
      back: false,
      left: false
    };
    return this;
  }

  override moveStop(): void {
    super.moveStop();
    this.clearUserDirection();
    GAME.userMove();
  }

  clearUserDirection() {
    this.userDirection.front = false;
    this.userDirection.right = false;
    this.userDirection.back = false;
    this.userDirection.left = false;
  }

  userMoveUpdate(): void {
    const { front, right, back, left } = this.userDirection;
    let moveDirection: number;

    if (front && right) moveDirection = Math.PI * 0.25;
    else if (back && right) moveDirection = Math.PI * 0.75;
    else if (back && left) moveDirection = Math.PI * 1.25;
    else if (front && left) moveDirection = Math.PI * 1.75;
    else if (front) moveDirection = 0;
    else if (right) moveDirection = Math.PI * 0.5;
    else if (back) moveDirection = Math.PI * 1;
    else if (left) moveDirection = Math.PI * 1.5;
    else {
      this.data.forcePercent = 0;
      GAME.userMove();
      return;
    }

    const { position, directionPoint } = this.data;
    this.updateDirection(moveDirection);
    
    let needStop = this.checkMoveProgress(position, directionPoint);
    
    if (needStop) {
      this.clearUserDirection();
      return;
    }

    this.data.forcePercent = 1;
    GAME.userMove();

    this.moveStart();
  }

}

export {
  UserGameObject
};