import {
  WorldScreen
} from '../world_screen';

import {
  UserGameObject
} from '../user_game_object';

interface UserDirection {
  front: boolean;
  right: boolean;
  back: boolean;
  left: boolean;
}

const UserGameObject_Mod = UserGameObject as Modifiable<typeof UserGameObject>;
class UserGameObject_wasdMove extends UserGameObject_Mod.Latest {

  userDirection: UserDirection;
  
  protected override initialize_vars(): void {
    super.initialize_vars();
    this.userDirection = {
      front: false,
      right: false,
      back: false,
      left: false
    };
  }

  override moveStop(): void {
    super.moveStop();
    this.clearUserDirection();
  }

  protected clearUserDirection() {
    this.userDirection.front = false;
    this.userDirection.right = false;
    this.userDirection.back = false;
    this.userDirection.left = false;
  }

  override userMoveUpdate(): void {
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
      this.moveStop();
      return;
    }

    this.updateDirection(moveDirection);
    
    super.userMoveUpdate();
  }

}

UserGameObject_Mod.modify(UserGameObject_wasdMove);


const WorldScreen_Mod = WorldScreen as Modifiable<typeof WorldScreen>;
class WorldScreen_wasdMove extends WorldScreen_Mod.Latest {

  protected override initialize_user_events(
    character: UserGameObject_wasdMove
  ): void {
    super.initialize_user_events(character);
    this.add_user_move_start_event(character);
    this.add_user_move_stop_event(character);
  }

  protected add_user_move_start_event(
    character: UserGameObject_wasdMove
  ): void {
    const keyDownHandler = event => {
      if (event.repeat) {
        return;
      }

      if (event.keyCode === 87) {
        character.userDirection.front = true;
      } else
      if (event.keyCode === 68) {
        character.userDirection.right = true;
      } else
      if (event.keyCode === 83) {
        character.userDirection.back = true;
      } else
      if (event.keyCode === 65) {
        character.userDirection.left = true;
      } else {
        return;
      }

      character.userMoveUpdate();
    };
    document.addEventListener('keydown', keyDownHandler);
    this.destroy_world_handlers.push(() => {
      document.removeEventListener('keydown', keyDownHandler);
    });
  }

  protected add_user_move_stop_event(
    character: UserGameObject_wasdMove
  ): void {
    const keyUpHandler = event => {
      if (event.keyCode === 87) {
        character.userDirection.front = false;
      } else
      if (event.keyCode === 68) {
        character.userDirection.right = false;
      } else
      if (event.keyCode === 83) {
        character.userDirection.back = false;
      } else
      if (event.keyCode === 65) {
        character.userDirection.left = false;
      } else {
        return;
      }
      
      character.userMoveUpdate();
    };
    document.addEventListener('keyup', keyUpHandler);
    this.destroy_world_handlers.push(() => {
      document.removeEventListener('keyup', keyUpHandler);
    });
  }

}

WorldScreen_Mod.modify(WorldScreen_wasdMove);

export {
  UserGameObject_wasdMove,
  WorldScreen_wasdMove
};