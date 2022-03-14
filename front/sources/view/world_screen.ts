import type {
  CharacterData
} from '../game';

import {
  ViewNode
} from './view_node';

import {
  GameObject
} from './game_object';

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

  updateUser(): void {
    const character = GAME.store.getUserCharacter();
    this.user_character_name_node.setValue(character.name);
    this.initialize_user_character();
  }

  protected initialize_user_character(): void {
    const index = GAME.store.getUserIndex();
    const character = this.characters[index];
    character.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#user-character-prefab');
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
  
}

export {
  WorldScreen
};