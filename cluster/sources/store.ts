import type {
  CharacterParameters
} from './mechanics/index';

import type {
  Socket
} from './socket';

import {
  Session
} from './session';

interface CharacterInfo {
  characterId: number;
  sessionId: number;
}

class Store {

  protected characters_collect: Associative<CharacterParameters>;
  protected characters_find: string[];
  protected characters_info: Associative<CharacterInfo>;
  protected sockets: Associative<Socket>;
  protected sessions: Session[];
  protected open_session: Session;

  initialize() {
    this.characters_collect = {};
    this.characters_find = [];
    this.characters_info = {};
    this.sockets = {};
    this.sessions = [];
  }

  hasCharacter(name: string): boolean {
    return this.characters_collect.hasOwnProperty(name);
  }

  getCharacter(name: string): CharacterParameters {
    return this.characters_collect[name];
  }

  addNewCharacter(name: string, parameters: CharacterParameters): void {
    this.characters_collect[name] = parameters
  }

  addSocket(name: string, socket: Socket): void {
    this.sockets[name] = socket;
  }

  getSocket(name: string): Socket {
    return this.sockets[name];
  }

  addFindCharacter(name: string): void {
    if (this.characters_find.includes(name)) {
      return;
    }
    this.characters_find.push(name);
  }

  getFindCharacters(): string[] {
    return this.characters_find;
  }

  removeFindCharacter(name: string): boolean {
    const index = this.characters_find.indexOf(name);
    if (index === -1) {
      return false;
    }
    this.characters_find.splice(index, 1);
    return true;
  }

  getCharacterInfo(name: string): CharacterInfo {
    return this.characters_info[name];
  }

  addCharacterInfo(name: string, sessionId: number, characterId: number): void {
    this.characters_info[name] = {
      sessionId,
      characterId
    };
  }

  removeCharacterInfo(name: string) {
    delete this.characters_info[name];
  }

  createSession(): Session {
    const session = (new Session).initialize();
    const id = this.sessions.length;
    this.sessions.push(session);
    session.setId(id);
    return session;
  }

  getSession(id: number): Session {
    return this.sessions[id];
  }

}

export {
  Store
};