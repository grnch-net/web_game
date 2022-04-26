import {
  ViewNode
} from './view_node';

class MainScreen {

  protected main_screen_node: ViewNode;
  protected find_screen_node: ViewNode;
  protected name_input_node: ViewNode;
  protected create_character_button_node: ViewNode;
  // protected get_character_data_node: ViewNode;
  protected find_session_button_node: ViewNode;
  protected cancel_find_session_button_node: ViewNode;

  initialize(): MainScreen {
    this.initialize_nodes();
    this.initialize_handlers();
    this.showMainScreen();
    return this;
  }

  protected initialize_nodes(): void {
    this.main_screen_node = new ViewNode().initialize('#main-screen');
    this.find_screen_node = new ViewNode().initialize('#find-screen');
    this.name_input_node = new ViewNode().initialize('#character-name');
    this.create_character_button_node = new ViewNode().initialize('#character-create');
    // this.get_character_data_node = new ViewNode().initialize('#character-get');
    this.find_session_button_node = new ViewNode().initialize('#find-session');
    this.cancel_find_session_button_node = new ViewNode().initialize('#cancel-find-session');
  }

  protected initialize_handlers() {
    this.create_character_button_node.addClick(() => this.create_character());
    // this.get_character_data_node.addClick(() => GAME.getCharacterData(this.name_input_node.getValue()));
    this.find_session_button_node.addClick(() => this.find_session());
    this.cancel_find_session_button_node.addClick(() => this.cancel_find_session());
  }

  showMainScreen(): void {
    this.main_screen_node.show();
    this.find_screen_node.hide();
  }

  showFindScreen(): void {
    this.main_screen_node.hide();
    this.find_screen_node.show();
  }
  
  hide(): void {
    this.main_screen_node.hide();
    this.find_screen_node.hide();
  }

  protected async create_character(): Promise<void> {
    this.create_character_button_node.hide();
    const character_name = this.name_input_node.getValue();
    await GAME.createCharacter(character_name)
    this.create_character_button_node.show();
  }

  protected find_session(): void {
    this.showFindScreen();
    const character_name = this.name_input_node.getValue();
    GAME.findSession(character_name);
  }

  protected async cancel_find_session(): Promise<void> {
    GAME.cancelFindSession();
  }

}

export {
  MainScreen
};