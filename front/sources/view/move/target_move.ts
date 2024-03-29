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
class WorldScreen_targetMove extends WorldScreen_Mod.Latest {

  protected override initialize_user_events(
    character: UserGameObject
  ): void {
    super.initialize_user_events(character);
    this.add_user_target_move_event(character);
  }

  protected add_user_target_move_event(
    character: UserGameObject
  ): void {
    const mouse_up_handler = event => {
      const { longitude } = GAME.store.worldConfig;
      const character_position = {
        x: character.data.position.x,
        y: character.data.position.y,
        z: longitude - character.data.position.z
      };

      const cursor_position = {
        x: event.offsetX * (200 / 500) - 10,
        y: 0,
        z: event.offsetY * (200 / 500) - 10
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

      character.userMoveTo(cursor_position, length);
      document.removeEventListener('mouseup', mouse_up_handler);
    };

    document.addEventListener('mouseup', mouse_up_handler);
    this.scene_node.node.addEventListener('mousedown', mouse_up_handler);

    this.destroy_world_handlers.push(() => {
      document.removeEventListener('mouseup', mouse_up_handler);
      this.scene_node.node.removeEventListener('mousedown', mouse_up_handler);
    });
  }

}

WorldScreen_Mod.modify(WorldScreen_targetMove);


const GameObject_Mod = GameObject as Modifiable<typeof GameObject>;
class GameObject_targetMove extends GameObject_Mod.Latest {



}

GameObject_Mod.modify(GameObject_targetMove);


const UserGameObject_Mod = UserGameObject as Modifiable<typeof UserGameObject>;
class UserGameObject_targetMove extends UserGameObject_Mod.Latest {

}

UserGameObject_Mod.modify(UserGameObject_targetMove);

export {
  WorldScreen_targetMove,
  GameObject_targetMove,
  UserGameObject_targetMove
};