import {
  ViewNode
} from './view_node';

class MainScreen {

  protected main_screen_node: ViewNode;
  protected name_input_node: ViewNode;
  protected create_character_button_node: ViewNode;
  protected enter_to_world_button_node: ViewNode;

  initialize(): MainScreen {
    this.initialize_nodes();
    this.initialize_handlers();
    return this;
  }

  protected initialize_nodes(): void {
    this.main_screen_node = new ViewNode().initialize('#main-screen');
    this.name_input_node = new ViewNode().initialize('#character-name');
    this.create_character_button_node = new ViewNode().initialize('#character-create');
    this.enter_to_world_button_node = new ViewNode().initialize('#character-enter');
  }

  protected initialize_handlers() {
    this.create_character_button_node.addClick(() => this.create_character());
      // character_get_node.addClick(() => this.game.getCharacter(this.getInputName()));
    this.create_character_button_node.addClick(() => this.enter_to_world());
  }

  show(): void {
    this.main_screen_node.show();
  }
  
  hide(): void {
    this.main_screen_node.hide();
  }

  protected async create_character(): Promise<void> {
    this.create_character_button_node.hide();
    const character_name = this.name_input_node.getValue();
    await GAME.createCharacter(character_name)
    this.create_character_button_node.show();
  }

  protected async enter_to_world(): Promise<void> {
    this.enter_to_world_button_node.hide();
    const character_name = this.name_input_node.getValue();
    await GAME.enterToWorld(character_name);
    this.enter_to_world_button_node.show();
  }

}

export {
  MainScreen
};