import type {
  Character,
  CharacterParameters
} from './mechanics/index';

import {
  Session,
  WorldData
} from './session';

class Store {

  protected characters_collect: Associative<CharacterParameters>;
  protected characters_in_world: string[];
  protected sessions: Session[];
  protected open_session: Session;

  initialize() {
    this.characters_collect = {};
    this.characters_in_world = [];
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

  hasCharacterInWorld(name: string): boolean {
    return this.characters_in_world.includes(name);
  }

  getCharacterInWorld(index: number): string {
    return this.characters_in_world[index];
  }

  addCharacterInWorld(id: number, name: string): void {
    this.characters_in_world[id] = name;
  }

  removeWorldCharacter(index: number) {
    this.characters_in_world[index] = null;
  }

  protected create_session(): void {
    this.open_session = (new Session).initialize();
    const id = this.sessions.push(this.open_session);
    this.open_session.id = id;
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