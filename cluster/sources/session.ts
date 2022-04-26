import type {
  Socket
} from './socket';

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
  }

  protected create_world(): void {
    this.world = (new World).initialize();
  }

  setId(id: number): void {
    this.id = id;
  }

  addSocket(
    id: number,
    socket: Socket
  ): void {
    this.sockets[id] = socket;
  }

  isOpen(): boolean {
    return this.status === SessionStatus.Open;
  }

  isLive(): boolean {
    return this.status === SessionStatus.Live;
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

  getWorldData(): WorldData {
    return this.worldData;
  }

  getWorldCharacterData(
    id: number
  ): CharacterWorldData {
    return this.worldData.characters[id];
  }

  removeWorldCharacter(id: number) {
    this.worldData.characters[id] = null;
  }

  runWorld(): void {
    for (const character of this.world.characters.elements) {
      if (!character) {
        continue;
      }

      this.initialize_world_character_data(character.id, character.parameters);
    }

    this.status = SessionStatus.Live;
    // this.world.startTicker();
  }

  initialize_world_character_data(
    id: number,
    characterParameters: CharacterParameters
  ): void {
    const character_attributes: Associative<number> = {};
    for (const key in characterParameters.attributes) {
      const attribute = characterParameters.attributes[key];
      character_attributes[key] = attribute.value;
    }

    const character_effects: number[] = [];
    for (const effect of characterParameters.effects) {
      character_effects.push(effect.id as number);
    }

    const character_equips: number[] = [];
    for (const equip of characterParameters.equips) {
      character_equips.push(equip.id as number);
    }

    const charWorldData: CharacterWorldData = {
      name: characterParameters.name,
      position: characterParameters.position,
      rotation: characterParameters.rotation,
      moveForce: characterParameters.moveForce,
      attributes: character_attributes,
      effects: character_effects,
      equips: character_equips
    };

    this.worldData.characters[id] = charWorldData;
  }

}

export {
  Session,
  WorldData,
  CharacterWorldData,
  Position
};