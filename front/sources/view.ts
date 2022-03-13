import type {
  Game,
  CharacterData,
  WorldData
} from './game';

class MainScreen {

  protected main_screen_node: HTMLElement;
  protected name_input_node: HTMLInputElement;
  protected create_character_button_node: HTMLElement;
  protected enter_to_world_button_node: HTMLElement;

  initialize() {
    this.initialize_nodes();
  }

  protected initialize_nodes(): void {
    this.main_screen_node = document.querySelector('#main-screen');
    this.name_input_node = document.querySelector('#character-name');
    this.create_character_button_node = document.querySelector('#character-create');
    this.enter_to_world_button_node = document.querySelector('#character-enter');
  }

  initializeHandlers(
    game: Game
  ) {
    this.create_character_button_node.addEventListener('click' , () => game.createCharacter(this.getInputName()));
      // character_get_node.addEventListener('click' , () => this.getCharacterRequest(this.getInputName()));
    this.create_character_button_node.addEventListener('click' , () => game.enterToWorld(this.getInputName()));
  }

  hide(): void {
    this.main_screen_node.style.display = 'none';
  }

  show(): void {
    // TODO:
  }

  getInputName(): string {
    return this.name_input_node.value;
  }

  hideEnterToWorldButton(): void {
    this.enter_to_world_button_node.style.display = 'none';
  }

  showEnterToWorldButton(): void {
    this.enter_to_world_button_node.style.display = '';
  }

}

class WorldScreen {

  protected world_screen_node: HTMLElement;
  protected world_characters_list_node: HTMLElement;
  protected character_leave_button_node: HTMLElement;
  protected character_cancel_leave_button_node: HTMLElement;
  protected user_character_name_node: HTMLElement;
  protected world_chat_node: HTMLElement;
  protected character_say_button_node: HTMLElement;
  protected character_say_input_node: HTMLElement;
  protected scene_node: SVGElement;
  protected game_node: HTMLElement;

  initialize(): void {
    this.world_screen_node = document.querySelector('#world-screen');
    this.world_characters_list_node = document.querySelector('#world-characters');
    this.character_leave_button_node = document.querySelector('#character-leave');
    this.character_cancel_leave_button_node = document.querySelector('#character-cancel-leave');
    this.user_character_name_node = document.querySelector('#user-character-name');
    this.world_chat_node = document.querySelector('#world-chat');
    this.character_say_button_node = document.querySelector('#character-say');
    this.character_say_input_node = document.querySelector('#character-say-text');
    this.scene_node = document.querySelector('svg');
    this.game_node = document.querySelector('#world-scene');
  }

  initializeHandlers(
    game: Game
  ) {
    // TODO:
  }

  hide(): void {
    // TODO:
  }

  show(): void {
    this.world_screen_node.style.display = '';
  }

}

class View {

  protected game: Game
  protected main_screen: MainScreen;
  protected world_screen: WorldScreen;
  protected characters_nodes: SVGElement[];
  protected destroy_world_handlers: (() => void)[];

  initialize(
    game: Game
  ): void {
    this.game = game;
    this.initialize_screens();
  }

  protected initialize_screens(): void {
    this.main_screen = new MainScreen;
    this.main_screen.initialize();

    this.world_screen = new WorldScreen;
    this.world_screen.initialize();
  }

  protected async enter_to_world(): Promise<void> {
    const character_name = this.main_screen.getInputName();
    this.main_screen.hideEnterToWorldButton();
    await this.game.enterToWorld(character_name);
    this.main_screen.showEnterToWorldButton();
  }

  createWorld(
    data: WorldData
  ): void {
    this.main_screen.hide();
    this.world_screen.show();
    // user_character_name_node.value = this.character.name;
    // character_leave_button_node.style.display = '';
    // character_cancel_leave_button_node.style.display = 'none';

    // this.updateWorldCharactersList();
    this.init_scene(data);
  }

  protected init_scene(
    data: WorldData
  ): void {
    // this.characters_nodes = [];

    for (const index in data.characters) {
      const character = data.characters[index];
      if (!character) {
        continue;
      }
      this.addCharacter(+index, character);
    }

    this.initialize_user_character();
    // this.initUserListeners();
  }

  protected initialize_user_character(): void {
    // this.create_scene_character(this.worldIndex, this.character, '#user-character-prefab');
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    this.create_scene_character(index, data);
  }

  protected create_scene_character(
    index: number,
    data: CharacterData
  ): void {
    // const prefab = '#character-prefab';
    // const character_node = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    // character_node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', prefab);
    // this.characters_nodes[index] = character_node;
    // game_node.appendChild(character_node);
    // this.updateCharacterPosition(index, character);
  }

  removeCharacter(
    index: number
  ) {
    // this.updateWorldCharactersList();

    // const character_node = this.characters_nodes[index];
    // delete this.characters_nodes[index];
    // game_node.removeChild(character_node);
  }

  protected logout(): void {
    // character_leave_button_node.style.display = 'none';
    // character_cancel_leave_button_node.style.display = '';
    this.game.logout();
  }

  protected cancel_logout(): void {
    // character_leave_button_node.style.display = '';
    // character_cancel_leave_button_node.style.display = 'none';
    this.game.cancelLogout();
  }

  protected say(
    message: string
  ) {
    // const message = character_say_input_node.value;
    // character_say_input_node.value = '';
    this.game.say(message);
  }

  newMessage(
    name: string,
    message: string
  ): void {
    // world_chat_node.value += `\n${name}: ${message}`;
    // world_chat_node.scrollTo(0, world_chat_node.scrollHeight);
  }

  destroyWorld(): void {
    // main_screen_node.style.display = '';
    // world_screen_node.style.display = 'none';
    // user_character_name_node.value = '';

    // while (game_node.firstChild) {
    //   game_node.removeChild(game_node.lastChild);
    // }

    // this.destroy_world_handlers.forEach(callback => callback());
    // this.destroy_world_handlers = [];
  }

}

export {
  View
};