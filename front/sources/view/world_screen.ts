import type {
  CharacterData,
  MoveData,
} from '../game';

import {
  SkillName
} from '../config';

import {
  ViewNode
} from './view_node';

import {
  GameObject
} from './game_object';

import {
  UserGameObject
} from './user_game_object';

interface TargetInteract {
  worldIndex: number,
  hit: boolean
}

@UTILS.modifiable
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
    this.initialize_handlers();
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

  initialize_handlers() {
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
    const character = new UserGameObject().initialize(data);
    this.characters[index] = character;
    this.game_node.addChild(character);
    this.initialize_user_events(character);
  }

  protected initialize_user_events(
    character: UserGameObject
  ): void {
    this.add_user_use_skill_event(character);
  }

  protected add_user_use_skill_event(
    character: UserGameObject
  ): void {
    const keyUpHandler = event => {
      let skill_id: number;

      if (event.keyCode === 49) {
        character.cancelUseSkill();
        GAME.userCancelUseSkill();
        return;
      } else
      if (event.keyCode === 50) {
        skill_id = SkillName.Attack;
      } else
      if (event.keyCode === 51) {
        skill_id = SkillName.Block;
      } else {
        return;
      }
      
      character.useSkill(skill_id);
      GAME.userUseSkill(skill_id);
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
    const character = new GameObject().initialize(data);
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

  characterUseSkill(
    index: number,
    skillId: number
  ): void {
    const character = this.characters[index];
    character.useSkill(skillId);
  }

  characterApplySkill(
    index: number,
    skillId: number
  ): void {
    const character = this.characters[index];
    character.applySkill(skillId);
  }

  characterCancelUseSkill(
    index: number
  ): void {
    const character = this.characters[index];
    character.cancelUseSkill();
  }

  interact(
    skillId: number,
    targets: TargetInteract[]
  ): void {
    if (skillId == SkillName.Attack) {
      for (const target of targets) {
        const character = this.characters[target.worldIndex];
        if (target.hit) {
          character.applyAttack();
        }
      }
    }
  }
  
}

export {
  WorldScreen,
  TargetInteract
};