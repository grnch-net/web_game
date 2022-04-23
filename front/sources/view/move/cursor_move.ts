import type {
  PointParameters,
} from '../../game';

import {
  WorldScreen
} from '../world_screen';

import {
  GameObject
} from '../game_object';

import {
  UserGameObject
} from '../user_game_object';


const WorldScreen_Mod = WorldScreen as Modifiable<typeof WorldScreen>;
class WorldScreen_cursorMove extends WorldScreen_Mod.Latest {

  protected override initialize_user_events(
    character: UserGameObject
  ): void {
    super.initialize_user_events(character);
    this.add_user_cursor_move_event(character);
  }

  protected add_user_cursor_move_event(
    character: UserGameObject
  ): void {
    const mouse_move_handler = event => {
      const { longitude } = GAME.store.worldConfig;
      const character_position = {
        x: character.data.position.x + 10,
        z: longitude - character.data.position.z + 10
      };

      const cursor_position = {
        x: event.offsetX * (200 / 500),
        z: event.offsetY * (200 / 500)
      };

      const qX = (cursor_position.x - character_position.x) ** 2;
      const qZ = (cursor_position.z - character_position.z) ** 2;
      const length = Math.sqrt(qX + qZ);

      const direction_x = (cursor_position.x - character_position.x) / length;
      const direction_z = -(cursor_position.z - character_position.z) / length;
		
      let angle = Math.acos(-direction_x);
      if(direction_z < 0) angle = angle * -1;

      character.data.rotation = (angle + Math.PI * 1.5) % (Math.PI * 2);

      character.direction.x = direction_x;
      character.direction.z = direction_z;
      character.data.direction = character.data.rotation;

      character.userMoveUpdate();
    };

    const mouse_up_handler = () => {
      character.moveStop();
      document.removeEventListener('mousemove', mouse_move_handler);
      document.removeEventListener('mouseup', mouse_up_handler);
    };

    const mouse_down_handler = event => {
      mouse_move_handler(event);
      document.addEventListener('mousemove', mouse_move_handler);
      document.addEventListener('mouseup', mouse_up_handler);
    };

    this.scene_node.node.addEventListener('mousedown', mouse_down_handler);

    this.destroy_world_handlers.push(() => {
      mouse_up_handler();
      document.removeEventListener('mouseup', mouse_up_handler);
      this.scene_node.node.removeEventListener('mousedown', mouse_down_handler);
    });
  }

}

WorldScreen_Mod.modify(WorldScreen_cursorMove);


const GameObject_Mod = GameObject as Modifiable<typeof GameObject>;
class GameObject_cursorMove extends GameObject_Mod.Latest {

  override updateMove(
    position: [number, number, number],
    rotation: number,
    direction: number,
    forcePercent: number
  ): void {
    super.updateMove(position, rotation, direction, forcePercent);
    
    if (forcePercent || forcePercent === 0) {
      this.data.forcePercent = forcePercent;
      if (forcePercent > 0) {
        this.moveStart();
      }
    }
  }

  override moveStart(): void {
    if (this.data.forcePercent !== 0) {
      setTimeout(() => this.move_progress());
    }
    this.update_time = performance.now();
  }

  protected override check_move_progress(
    position: PointParameters,
    direction: PointParameters
  ): boolean {
    const { latitude, longitude, height } = GAME.store.worldConfig;
    let needStop = false;
    
    if (direction.x > 0) {
      if (position.x > latitude) {
        position.x = latitude;
        needStop = true;
      }
    } else
    if (direction.x < 0) {
      if (position.x < 0) {
        position.x = 0;
        needStop = true;
      }
    }
    
    if (direction.y > 0) {
      if (position.y > height) {
        position.y = height;
        needStop = true;
      }
    } else
    if (direction.y < 0) {
      if (position.y < 0) {
        position.y = 0;
        needStop = true;
      }
    }
    
    if (direction.z > 0) {
      if (position.z > longitude) {
        position.z = longitude;
        needStop = true;
      }
    } else
    if (direction.z < 0) {
      if (position.z < 0) {
        position.z = 0;
        needStop = true;
      }
    }

    return needStop;
  }

  protected move_progress() {
    if (this.data.forcePercent === 0) {
      return;
    }

    const lastTime = this.update_time;
    const nowTime = this.update_time = performance.now();
    
    const dt = (nowTime - lastTime) / 100;
    const moveForce = this.data.moveForce * this.data.forcePercent;
    const position = {
      x: this.data.position.x,
      y: this.data.position.y,
      z: this.data.position.z
    };

    position.x += this.direction.x * moveForce * dt;
    position.y += this.direction.y * moveForce * dt;
    position.z += this.direction.z * moveForce * dt;

    let needStop = this.check_move_progress(position, this.direction);

    this.data.position.x = position.x;
    this.data.position.y = position.y;
    this.data.position.z = position.z;
    this.updateTransform();

    if (needStop) {
      this.moveStop();
    }

    setTimeout(() => this.move_progress());
  }

  override moveStop(): void {
    this.data.forcePercent = 0;
  }

}

GameObject_Mod.modify(GameObject_cursorMove);


const UserGameObject_Mod = UserGameObject as Modifiable<typeof UserGameObject>;
class UserGameObject_cursorMove extends UserGameObject_Mod.Latest {

  override moveStop(): void {
    super.moveStop();
    GAME.userMove();
  }

  override userMoveUpdate(): void {
    const { position } = this.data;
    let needStop = this.check_move_progress(position, this.direction);
    
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

}

UserGameObject_Mod.modify(UserGameObject_cursorMove);

export {
  WorldScreen_cursorMove,
  GameObject_cursorMove,
  UserGameObject_cursorMove
};