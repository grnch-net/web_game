import type {
  Character,
  CharacterParameters
} from './mechanics/index';

import * as crypto from 'crypto';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CharacterWorldData {
  name: string;
  position: Position;
  rotation: number;
  moveForce: number;
  attributes: Associative<number>;
  effects: number[];
  equips: number[];
}

interface WorldData {
  characters: CharacterWorldData[]
}

class Store {

  protected charactersCollect: Associative<CharacterParameters>
  protected worldData: WorldData
  protected socketsId: string[]
  protected charactersInWorld: string[]
  protected charactersSecret: { [secret: string]: Character }

  initialize() {
    this.charactersCollect = {};
    this.worldData = {
      characters: []
    };
    this.socketsId = [];
    this.charactersInWorld = [];
    this.charactersSecret = {};
  }

  hasCharacter(name: string): boolean {
    return this.charactersCollect.hasOwnProperty(name);
  }

  getCharacter(name: string): CharacterParameters {
    return this.charactersCollect[name];
  }

  addNewCharacter(name: string, parameters: CharacterParameters): void {
    this.charactersCollect[name] = parameters
  }


  hasCharacterInWorld(name: string): boolean {
    return this.charactersInWorld.includes(name);
  }

  getCharacterInWorld(index: number): string {
    return this.charactersInWorld[index];
  }

  addCharacterInWorld(index: number, name: string): void {
    this.charactersInWorld[index] = name;
  }


  protected generateSecretKey(): string {
    return crypto.randomBytes(10).toString('hex');
  }

  createSecretCharacter(data: Character): string {
    const secret = this.generateSecretKey();
    this.charactersSecret[secret] = data;
    return secret;
  }

  getSecretCharacter(secret: string): Character {
    const character = this.charactersSecret[secret];
    delete this.charactersSecret[secret];
    return character;
  }


  getSocketId(index: number): string {
    return this.socketsId[index];
  }

  addSocketsId(index: number, id: string): void {
    this.socketsId[index] = id;
  }


  getWorldData(): WorldData {
    return this.worldData;
  }

  getWorldCharacterData(index: number): CharacterWorldData {
    return this.worldData.characters[index];
  }

  addWorldCharacterData(index: number, characterData: CharacterWorldData): void {
    this.worldData.characters[index] = characterData;
  }

  removeWorldCharacter(index: number) {
    this.worldData.characters[index] = null;
    this.charactersInWorld[index] = null;
    this.socketsId[index] = null;
  }

}

export {
  Store,
  WorldData,
  CharacterWorldData,
  Position
};