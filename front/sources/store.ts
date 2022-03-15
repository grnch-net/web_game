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
  protected worldData: WorldData;

  initialize(): Store {
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

  updateWorld(
    data: WorldData
  ): void {
    this.worldData = data;
  }

  updateUser(
    index: number,
    data: CharacterData
  ): void {
    this.addCharacter(index, data);
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    if (!this.worldData) {
      console.error('need_create_world');
      return;
    }
    if (this.worldData[index]) {
      console.error('character_already_exists');
      return;
    }
    this.initialize_character(data);
    this.worldData[index] = data;
  }

  protected initialize_character(
    data: CharacterData
  ): void {
    data.directionPoint = { x: 0, y: 0, z: 0 };
    data.forcePercent = 0;
  }

  getUserIndex(): number {
    return this.worldData?.userIndex;
  }

  getUserCharacter(): CharacterData {
    return this.worldData?.[this.getUserIndex()];
  }

  getWorldCharacters(): CharacterData[] {
    return this.worldData?.characters || [];
  }

  destroyWorld(): void {
    this.worldData = null;
  }
  
}

export {
  Store
};