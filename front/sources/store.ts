import type {
  CharacterData,
  WorldData
} from './game';

interface WorldConfig {
  latitude: number,
  longitude: number,
  height: number
};

class Store {

  worldConfig: WorldConfig;
  userId: number;
  protected worldData: WorldData;

  initialize(): Store {
    this.userId = null;
    this.initialize_configs();
    return this;
  }

  protected initialize_configs(): void {
    this.worldConfig = {
      latitude: 180,
      longitude: 180,
      height: 1
    };
  }

  leaveSession(): void {
    this.worldData = null;
  }

  updateWorld(
    data: WorldData
  ): void {
    this.worldData = data;
  }

  updateUserId(
    id: number
  ): void {
    this.userId = id;
  }

  updateUserCharacter(
    data: CharacterData
  ): void {
    if (this.userId === null) {
      console.error('updateUserCharacter: id is undefined');
      return;
    }
    this.addCharacter(this.userId, data);
  }

  addCharacter(
    id: number,
    data: CharacterData
  ): void {
    if (!this.worldData) {
      console.error('need_create_world');
      return;
    }
    if (this.worldData[id]) {
      console.error('character_already_exists');
      return;
    }
    this.worldData.characters[id] = data;
  }

  removeCharacter(
    id: number
  ): void {
    delete this.worldData.characters[id];
  }

  getUserId(): number {
    return this.userId;
  }

  getUserCharacter(): CharacterData {
    if (!this.worldData) {
      console.error('getUserCharacter: worldData is undefined');
      return;
    }
    return this.worldData.characters[this.getUserId()];
  }

  getWorldCharacters(): CharacterData[] {
    if (!this.worldData) {
      console.error('getWorldCharacters: worldData is undefined');
      return [];
    }
    return this.worldData.characters;
  }
  
}

export {
  Store
};