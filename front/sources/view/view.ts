import type {
  CharacterData,
  MoveData,
  WorldData
} from '../game';

import {
  MainScreen
} from './main_screen';

import {
  WorldScreen
} from './world_screen';

class View {

  protected main_screen: MainScreen;
  protected world_screen: WorldScreen;

  initialize(): View {
    this.initialize_screens();
    return this;
  }

  protected initialize_screens(): void {
    this.main_screen = new MainScreen().initialize();
    this.world_screen = new WorldScreen().initialize();
  }

  createWorld(
    userData: CharacterData,
    worldData: WorldData
  ): void {
    this.main_screen.hide();
    this.world_screen.show();
    this.init_scene(worldData);
    
    this.world_screen.updateUser(userData);
    GAME.store.addCharacter(worldData.userIndex, userData);

    this.world_screen.updateCharactersList();
  }

  protected init_scene(
    data: WorldData
  ): void {
    for (const index in data.characters) {
      const character = data.characters[index];
      if (!character) {
        continue;
      }
      this.world_screen.addCharacter(+index, character);
    }
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    this.world_screen.addCharacter(index, data);
    this.world_screen.updateCharactersList();
  }

  removeCharacter(
    index: number
  ) {
    this.world_screen.removeCharacter(index);
    this.world_screen.updateCharactersList();
  }

  newMessage(
    index: number,
    message: string
  ): void {
    this.world_screen.newMessage(index, message);
  }

  destroyWorld(): void {
    this.world_screen.destroy();
    this.main_screen.show();
  }

  characterMove(data: MoveData): void {
    this.world_screen.characterMove(data);
  }

}

export {
  View
};