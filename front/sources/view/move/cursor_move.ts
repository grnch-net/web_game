import {
  WorldScreen
} from '../world_screen';

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

export {
  WorldScreen_cursorMove
};