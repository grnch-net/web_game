import type { CharacterParameters } from './mechanics/index';

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
  protected charactersSecret: { [secret: string]: number }

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

  createSecret(index: number): string {
    const secret = this.generateSecretKey();
    this.charactersSecret[secret] = index;
    return secret;
  }

  getSecretIndex(secret: string): number {
    const index = this.charactersSecret[secret];
    if (index == undefined) {
      return null;
    }
    delete this.charactersSecret[secret];
    return index
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
  CharacterWorldData
};