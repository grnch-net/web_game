import type {
  CharacterData,
  MoveData,
  PointParameters,
  WorldData
} from './game';

import {
  io,
  Socket
} from 'socket.io-client';

const apiUrl = 'http://localhost:3009';
const socketUrl = 'ws://localhost:3009';

const apiEvents = {
  CharacterCreate: '/character-create',
  CharacterGet: '/character-get'
};

const socketsEvents = {
  SessionEnter: 'session:enter',
  SessionCancelFind: 'session:cancel-find',
  SessionLeave: 'session:leave',
  WorldEnter: 'world:enter',
  WorldLeave: 'world:leave',
  WorldAction: 'world:action',
  CharSay: 'char:say',
  CharMove: 'char:move',
  CharMoveTo: 'char:move-to',
  CharUseSkill: 'char:use-skill',
  CharCancelUseSkill: 'char:cancel-use-skill',
};

interface WorldEnterData {
  characterId: number;
  worldData: WorldData;
}

class Network {

  protected socket: Socket;

  initialize(): Network {
    return this;
  }

  protected async send_request(
    path: string,
    data: any
  ): Promise<any> {
    const response = await fetch(apiUrl + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .catch(e => console.log(e));

    if (!response) {
      console.error('Fatal error.');
      return;
    } else
    if (response.error) {
      console.error(response);
      return;
    } else
    if (!response.data) {
      console.error(response);
      return;
    }

    console.log('Request', path, 'success', response.data);
    return response.data;
  }

  async createCharacter(
    characterName: string
  ): Promise<CharacterData> {
    const event = apiEvents.CharacterCreate;
    const data = await this.send_request(event, { name: characterName });
    return data?.parameters;
  }

  async getCharacterData(
    characterName: string
  ): Promise<CharacterData> {
    const event = apiEvents.CharacterGet;
    const data = await this.send_request(event, { name: characterName });
    return data?.parameters;
  }

  async findSession(
    characterName: string
  ): Promise<void> {
    const character_data = await this.getCharacterData(characterName);
    if (!character_data) {
      return;
    }

    this.create_socket();

    const event = socketsEvents.SessionEnter;
    this.socket.emit(event, { name: characterName });
  }

  protected create_socket(): void {
    this.socket = io(socketUrl);
    this.initialize_socket_session_events();
  }

  protected initialize_socket_session_events(): void {
    this.socket.on(socketsEvents.CharSay, data => {
      GAME.newMessage(data.id, data.message);
    });

    this.socket.on(socketsEvents.CharMove, (data: MoveData) => {
      GAME.characterMove(data);
    });

    this.socket.on(socketsEvents.CharMoveTo, (data: MoveData) => {
      GAME.characterMoveTo(data);
    });

    this.socket.on(socketsEvents.CharUseSkill, data => {
      console.log('Char use skill', data);
      GAME.characterUseSkill(data);
    });

    this.socket.on(socketsEvents.CharCancelUseSkill, data => {
      console.log('Char cancel use skill', data);
      GAME.characterCancelUseSkill(data);
    });

    this.socket.on(socketsEvents.WorldAction, data => {
      console.log('World action', data);
      GAME.worldAction(data);
    });

    this.socket.on(socketsEvents.SessionCancelFind, () => this.session_cancel_find());
    this.socket.on(socketsEvents.WorldEnter, data => this.world_enter(data));
    this.socket.on(socketsEvents.SessionLeave, data => this.session_leave(data.id));
  }

  protected session_cancel_find(): void {
    this.socket.disconnect();
    GAME.leaveSession();
  }

  protected world_enter({
    characterId,
    worldData
  }: WorldEnterData): void {
    GAME.enterToWorld(characterId, worldData);
  }

  protected session_leave(
    id: number
  ): void {
    const user_id = GAME.store.getUserId();

    if (user_id == id) {
      console.warn('Your char leave from session');
      this.socket.disconnect();
      GAME.leaveSession();
      return;
    }

    console.log('Player session leave', { id });
    // GAME.removeCharacter(id);
  }

  cancelFindSession() {
    this.socket.emit(socketsEvents.SessionCancelFind);
  }

  leaveSession() {
    this.socket.emit(socketsEvents.SessionLeave);
  }

  leaveWorld() {
    this.socket.emit(socketsEvents.WorldLeave);
  }

  say(
    message: string
  ) {
    this.socket.emit(socketsEvents.CharSay, { message });
  }

  userMove(): void {
    const data = GAME.store.getUserCharacter();
    const { x, y, z } = data.position;
    this.socket.emit(socketsEvents.CharMove, {
      rotation: data.rotation,
      position: [x, y, z],
      direction: data.direction,
      forcePercent: data.forcePercent
    });
  }

  userMoveTo(
    position: PointParameters
  ): void {
    const data = GAME.store.getUserCharacter();
    const { x, y, z } = position;
    this.socket.emit(socketsEvents.CharMoveTo, {
      rotation: data.rotation,
      position: [x, y, z]
    });
  }

  userUseSkill(
    skillId: number
  ): void {
    this.socket.emit(socketsEvents.CharUseSkill, {
      skillId
    });
  }

  userCancelUseSkill(): void {
    this.socket.emit(socketsEvents.CharCancelUseSkill);
  }

}

export {
  Network
};