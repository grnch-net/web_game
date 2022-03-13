import {
  Store
} from './store';

import {
  Network
} from './network';

import {
  View
} from './view';

interface PointParameters {
  x: number;
  y: number;
  z: number;
}

interface CharacterData {
  name: string;
  directionPoint: PointParameters;
  forcePercent: number;
}

interface WorldData {
  userIndex: number;
  characters: CharacterData[];
}

class Game {

  store: Store;
  network: Network;
  view: View;

  initialize(): void {
    this.initialize_store();
    this.initialize_network();
    this.initialize_view();
  }

  protected initialize_store(): void {
    this.store = new Store;
    this.store.initialize();
  }

  protected initialize_network(): void {
    this.network = new Network;
    this.network.initialize(this);
  }

  protected initialize_view(): void {
    this.view = new View;
    this.view.initialize(this);
  }

  async createCharacter(
    characterName: string
  ): Promise<CharacterData> {
    return await this.network.createCharacter(characterName);
  }

  async enterToWorld(
    characterName: string,
  ): Promise<boolean> {
    const user_data = await this.network.getCharacterData(characterName);
    if (!user_data) {
      return false;
    }
    const world_data = await this.network.enterToWorld(characterName);
    world_data.characters[world_data.userIndex] = user_data;
    this.store.updateWorld(world_data);
    this.view.createWorld(world_data);
    return true;
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    this.store.addCharacter(index, data);
    this.view.addCharacter(index, data);
  }

  removeCharacter(
    index: number
  ): void {
    delete this.store.worldData.characters[index];
    this.view.removeCharacter(index);
  }

  logout(): void {
    this.network.logout();
  }

  cancelLogout(): void {
    this.network.cancelLogout();
  }

  say(
    message: string
  ): void {
    this.network.say(message);
  }

  newMessage(
    index: number,
    message: string
  ): void {
    const name = this.store.worldData.characters[index]?.name;
    this.view.newMessage(name, message);
  }

}

export {
  Game,
  CharacterData,
  WorldData
};