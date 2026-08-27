import type {
  CharacterData,
  MoveData,
  MoveToData
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
  id: number,
  hit: boolean
}

@UTILS.modifiable
class WorldScreen {

  protected world_screen_node: ViewNode;
  protected world_characters_list_node: ViewNode;
  protected logout_button_node: ViewNode;
  protected user_character_data_node: ViewNode;
  protected world_data_node: ViewNode;
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
    this.user_character_data_node = new ViewNode().initialize('#user-character-data');
    this.world_data_node = new ViewNode().initialize('#world-data');
    this.world_chat_node = new ViewNode().initialize('#world-chat');
    this.character_say_button_node = new ViewNode().initialize('#character-say');
    this.character_say_input_node = new ViewNode().initialize('#character-say-text');
    this.scene_node = new ViewNode().initialize('svg');
    this.game_node = new ViewNode().initialize('#world-scene');
  }

  initialize_handlers() {
    this.logout_button_node.addClick(() => this.logout());
    this.character_say_button_node.addClick(() => this.say());
  }

  hide(): void {
    this.world_screen_node.hide();
  }

  show(): void {
    this.world_screen_node.show();
    this.logout_button_node.show();
  }

  protected logout(): void {
    this.logout_button_node.hide();
    // GAME.logout();
  }

  protected say() {
    const message = this.character_say_input_node.getValue();
    this.character_say_input_node.setValue('');
    GAME.say(message);
  }

  initializeUser(
    userData: CharacterData
  ): void {
    this.initialize_user_character(userData);
  }

  protected initialize_user_character(
    data: CharacterData
  ): void {
    const user_id = GAME.store.getUserId();
    const character = new UserGameObject().initialize(data);
    this.characters[user_id] = character;
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
      GAME.userUseSkill(skill_id);
    };
    document.addEventListener('keyup', keyUpHandler);
    this.destroy_world_handlers.push(() => {
      document.removeEventListener('keyup', keyUpHandler);
    });
  }

  getCharacterDataLog(
    data: CharacterData
  ): string {
    let dataLog = '';
    dataLog += `${data.name}`;
    dataLog += `\n  Health: ${data.attributes.health}`;
    dataLog += `\n  Stamina: ${data.attributes.stamina}`;
    dataLog += `\n  Effects: ${JSON.stringify(data.effects)}`;
    // dataLog += `\nEquips: ${JSON.stringify(data.equips)}`;
    // dataLog += `\nSkills: ${JSON.stringify(data.skills)}`;
    // dataLog += `\nInventory: ${JSON.stringify(data.slots)}`;
    return dataLog;
  }

  updateWorldData(): void {
    const user_id = GAME.store.getUserId();
    const characters = GAME.store.getWorldCharacters();
    const name_list = [];
    let world_data_log = '';

    for (const id in characters) {
      const character = characters[+id];
      if (!character) {
        continue;
      }
      name_list.push(character.name);
      if (+id === user_id) {
        const data_log = this.getCharacterDataLog(character);
        this.user_character_data_node.setValue(data_log);
      } else {
        const data_log = this.getCharacterDataLog(character);
        world_data_log += data_log + '\n';
      }
    }

    this.world_characters_list_node.setValue(name_list.join(', '));
    this.world_data_node.setValue(world_data_log);
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
    this.game_node.removeChildren();

    this.destroy_world_handlers.forEach(callback => callback());
    this.destroy_world_handlers = [];
  }

  characterMove({
    id,
    position,
    rotation,
    direction,
    forcePercent
  }: MoveData): void {
    const character = this.characters[id];
    character.updateMove(position, rotation, direction, forcePercent);
  }

  characterMoveTo({
    id,
    position,
    rotation
  }: MoveToData): void {
    const character = this.characters[id];
    const { longitude } = GAME.store.worldConfig;
    const [x, y, z] = position;
    const point = { x, y, z: longitude - z };
    character.data.rotation = rotation;
    character.data.direction = rotation;
    character.updateDirection();
    character.moveTo(point);
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
        const character = this.characters[target.id];
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