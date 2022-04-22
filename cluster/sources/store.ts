import type {
  CharacterParameters
} from './mechanics/index';

import {
  Session
} from './session';

interface WorldCharacterInfo {
  characterId: number;
  sessionId: number;
}

class Store {

  protected characters_collect: Associative<CharacterParameters>;
  protected characters_in_world: Associative<WorldCharacterInfo>;
  protected sessions: Session[];
  protected open_session: Session;

  initialize() {
    this.characters_collect = {};
    this.characters_in_world = {};
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

  getWorldCharacterInfo(name: string): WorldCharacterInfo {
    return this.characters_in_world[name];
  }

  addCharacterInWorld(name: string, sessionId: number, characterId: number): void {
    this.characters_in_world[name] = {
      sessionId,
      characterId
    };
  }

  removeWorldCharacter(name: string) {
    delete this.characters_in_world[name];
  }

  protected create_session(): void {
    this.open_session = (new Session).initialize();
    const id = this.sessions.length;
    this.sessions.push(this.open_session);
    this.open_session.setId(id);
  }

  getOpenSession(): Session {
    if (!this.open_session || this.open_session.isFull()) {
      this.create_session();
    }

    return this.open_session;
  }

  getSession(id: number): Session {
    return this.sessions[id];
  }

}

export {
  Store
};