import type {
  CharacterData,
  MoveData
} from '../game';

import {
  ViewNode
} from './view_node';

import {
  GameObject
} from './game_object';

import {
  UserGameObject
} from './user_game_object';

class WorldScreen {

  protected world_screen_node: ViewNode;
  protected world_characters_list_node: ViewNode;
  protected logout_button_node: ViewNode;
  protected cancel_logout_button_node: ViewNode;
  protected user_character_name_node: ViewNode;
  protected world_chat_node: ViewNode;
  protected character_say_button_node: ViewNode;
  protected character_say_input_node: ViewNode;
  protected scene_node: ViewNode;
  protected game_node: ViewNode;
  protected characters: GameObject[];
  protected destroy_world_handlers: (() => void)[];

  initialize(): WorldScreen {
    this.characters = [];
    this.destroy_world_handlers = [];
    this.initialize_nodes();
    return this;
  }

  protected initialize_nodes(): void {
    this.world_screen_node = new ViewNode().initialize('#world-screen');
    this.world_characters_list_node = new ViewNode().initialize('#world-characters');
    this.logout_button_node = new ViewNode().initialize('#character-leave');
    this.cancel_logout_button_node = new ViewNode().initialize('#character-cancel-leave');
    this.user_character_name_node = new ViewNode().initialize('#user-character-name');
    this.world_chat_node = new ViewNode().initialize('#world-chat');
    this.character_say_button_node = new ViewNode().initialize('#character-say');
    this.character_say_input_node = new ViewNode().initialize('#character-say-text');
    this.scene_node = new ViewNode().initialize('svg');
    this.game_node = new ViewNode().initialize('#world-scene');
  }

  initializeHandlers() {
    this.logout_button_node.addClick(() => this.logout());
    this.cancel_logout_button_node.addClick(() => this.cancelLogout());
    this.character_say_button_node.addClick(() => this.say());
  }

  hide(): void {
    this.world_screen_node.hide();
  }

  show(): void {
    this.world_screen_node.show();
    this.logout_button_node.show();
    this.cancel_logout_button_node.hide();
  }

  protected logout(): void {
    this.logout_button_node.hide();
    this.cancel_logout_button_node.show();
    GAME.logout();
  }

  protected cancelLogout(): void {
    this.logout_button_node.show();
    this.cancel_logout_button_node.hide();
    GAME.cancelLogout();
  }

  protected say() {
    const message = this.character_say_input_node.getValue();
    this.character_say_input_node.setValue('');
    GAME.say(message);
  }

  updateUser(
    userData: CharacterData
  ): void {
    const index = GAME.store.getUserIndex();
    this.user_character_name_node.setValue(userData.name);
    this.initialize_user_character(index, userData);
  }

  protected initialize_user_character(
    index: number,
    data: CharacterData
  ): void {
    const character = new UserGameObject().create('#user-character-prefab', data);
    this.characters[index] = character;
    this.game_node.addChild(character);
    this.initialize_user_events(character);
  }

  protected initialize_user_events(
    character: UserGameObject
  ): void {
    this.add_user_move_start_event(character);
    this.add_user_move_stop_event(character);
  }

  protected add_user_rotate_event(
    character: UserGameObject
  ): void {
    let last_mouse_position: number;
    const mouseMoveHandler = event => {
      const rotate = (event.clientX - last_mouse_position) / 100;
      character.data.rotation += rotate;
      last_mouse_position = event.clientX;
      character.updateDirection();
      character.updatePosition();

      GAME.userMove();
    };
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    const mouseDownHandler = event => {
      last_mouse_position = event.clientX;
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };
    this.scene_node.node.addEventListener('mousedown', mouseDownHandler);
    this.destroy_world_handlers.push(() => {
      mouseUpHandler();
      document.removeEventListener('mouseup', mouseUpHandler);
      this.scene_node.node.removeEventListener('mousedown', mouseDownHandler);
    });
  }

  protected add_user_move_start_event(
    character: UserGameObject
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
    character: UserGameObject
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

  updateCharactersList(): void {
    const characters_list = [];
    const characters = GAME.store.getWorldCharacters();

    for (const character of characters) {
      if (!character) {
        continue;
      }
      characters_list.push(character.name);
    }

    this.world_characters_list_node.setValue(characters_list.join(', '));
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    const character = new GameObject().create('#character-prefab', data);
    this.characters[index] = character;
    this.game_node.addChild(character);
  }

  removeCharacter(
    index: number
  ): void {
    const character = this.characters[index];
    delete this.characters[index];
    this.game_node.removeChild(character);
  }

  newMessage(
    index: number,
    message: string
  ): void {
    const characters = GAME.store.getWorldCharacters();
    const name = characters[index]?.name;
    const value = this.world_chat_node.getValue() + `\n${name}: ${message}`;
    this.world_chat_node.setValue(value);
    const chat_node = this.world_chat_node.node;
    chat_node.scrollTo(0, chat_node.scrollHeight);
  }

  destroy(): void {
    this.hide();
    this.user_character_name_node.setValue('');
    this.game_node.removeChildren();

    this.destroy_world_handlers.forEach(callback => callback());
    this.destroy_world_handlers = [];
  }

  characterMove({
    worldIndex,
    position,
    rotation,
    direction,
    forcePercent
  }: MoveData): void {
    const character = this.characters[worldIndex];
    character.updateMove(position, rotation, direction, forcePercent);
  }
  
}

export {
  WorldScreen
};