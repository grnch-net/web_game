import type {
  Socket
} from './socket';

import * as crypto from 'crypto';

import {
  World,
  Character,
  CharacterParameters,
  // ActionListener
} from './mechanics/index';

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

enum SessionStatus {
  Open,
  Live,
  Finish
}

const PLAYERS_COUNT = 2;

class Session {

  world: World;
  id: number;
  sockets: Socket[];
  protected worldData: WorldData;
  protected socketsId: string[];
  protected charactersSecret: { [secret: string]: Character };
  protected status: SessionStatus;

  initialize(): Session {
    this.initialize_vars();
    this.create_world();
    this.status = SessionStatus.Open;
    return this;
  }

  protected initialize_vars(): void {
    this.worldData = {
      characters: []
    };
    this.sockets = [];
    this.socketsId = [];
    this.charactersSecret = {};
  }

  protected create_world(): void {
    this.world = (new World).initialize();
  }

  setId(id: number): void {
    this.id = id;
  }

  addSocket(
    socket: Socket
  ): void {
    this.sockets.push(socket);
  }

  isOpen(): boolean {
    return this.status === SessionStatus.Open;
  }

  isFull(): boolean {
    return this.world.characters.count == PLAYERS_COUNT;
  }

  enterToWorld(
    parameters: CharacterParameters
  ): Character {
    const character = new Character;
    character.initialize(parameters);
    this.world.addCharacter(character);
    return character;
  }

  // leaveFromWorld(
  //   index: number
  // ): boolean {
  //   return this.world.removeCharacter(index);
  // }

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

  addSocketId(index: number, id: string): void {
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
    // this.charactersInWorld[index] = null;
    this.socketsId[index] = null;
  }

  runWorld(): void {
    this.status = SessionStatus.Live;
    // this.world.startTicker();
  }

}

export {
  Session,
  WorldData,
  CharacterWorldData,
  Position
};