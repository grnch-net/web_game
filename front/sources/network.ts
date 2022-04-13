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
  CharacterGet: '/character-get',
  WorldEnter: '/world-enter',
  WorldLeave: '/world-leave'
};

const soketsEvents = {
  CharEnter: 'char:enter',
  CharLeave: 'char:leave',
  CharCancelLeave: 'char:cancel-leave',
  CharSay: 'char:say',
  CharMove: 'char:move',
  CharUseSkill: 'char:use-skill',
  CharCancelUseSkill: 'char:cancel-use-skill',
  WorldAction: 'world:action'
};

interface EnterToWorldData {
  secret: string;
  worldIndex: number;
  world: WorldData;
}

class Network {

  protected socket: Socket;

  initialize(): Network {
    return this;
  }

  async createCharacter(
    name: string
  ): Promise<CharacterData> {
    const event = apiEvents.CharacterCreate;
    const data = await this.send_request(event, { name });
    return data?.parameters;
  }

  async getCharacterData(
    name: string
  ): Promise<CharacterData> {
    const event = apiEvents.CharacterGet;
    const data = await this.send_request(event, { name });
    return data?.parameters;
  }

  async enterToWorld(
    characterName: string
  ): Promise<WorldData> {
    const data = await this.enter_to_world_request(characterName);
    if (!data) {
      return null;
    }
    data.world.userIndex = data.worldIndex;
    this.create_socket();
    this.enter_to_world_emit(data.secret);
    return data.world;
  }

  protected async enter_to_world_request(
    characterName: string
  ): Promise<EnterToWorldData> {
    const event = apiEvents.WorldEnter;
    const parameters = {
      name: characterName
    };
    return await this.send_request(event, parameters);
  }

  protected enter_to_world_emit(
    secret: string
  ): void {
    const event = soketsEvents.CharEnter;
    this.socket.emit(event, { secret });
  }

  protected async send_request(path, data) {
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

  protected create_socket(): void {
    this.socket = io(socketUrl);
    this.initialize_socket_events();
  }

  protected initialize_socket_events(): void {
    this.socket.on(soketsEvents.CharSay, data => {
      GAME.newMessage(data.worldIndex, data.message);
    });

    this.socket.on(soketsEvents.CharMove, (data: MoveData) => {
      GAME.characterMove(data);
    });

    this.socket.on(soketsEvents.CharUseSkill, data => {
      console.log('Char use skill', data);
      GAME.characterUseSkill(data);
    });

    this.socket.on(soketsEvents.CharCancelUseSkill, data => {
      console.log('Char cancel use skill', data);
      GAME.characterCancelUseSkill(data);
    });

    this.socket.on(soketsEvents.WorldAction, data => {
      console.log('World action', data);
      GAME.worldAction(data);
    });

    this.socket.on(soketsEvents.CharEnter, data => {
      console.log('Char enter to world', data);
      GAME.addCharacter(data.worldIndex, data.characterData);
    });

    this.socket.on(soketsEvents.CharLeave, data => this.char_leave(data.worldIndex));
  }

  protected char_leave(
    index: number
  ): void {
    const user_index = GAME.store.getUserIndex();

    if (user_index == index) {
      console.warn('Your char leave from world');
      this.socket.disconnect();
      GAME.destroyWorld();
      return;
    }

    GAME.removeCharacter(index);
  }

  logout() {
    this.socket.emit(soketsEvents.CharLeave);
  }

  cancelLogout(): void {
    this.socket.emit(soketsEvents.CharCancelLeave);
  }

  say(
    message: string
  ) {
    this.socket.emit(soketsEvents.CharSay, { message });
  }

  userMove(): void {
    const data = GAME.store.getUserCharacter();
    const { x, y, z } = data.position;
    this.socket.emit(soketsEvents.CharMove, {
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
    // this.socket.emit(soketsEvents.CharMove, {
    //   rotation: data.rotation,
    //   position: [x, y, z],
    //   direction: data.direction,
    //   forcePercent: data.forcePercent
    // });
  }

  userUseSkill(
    skillId: number
  ): void {
    this.socket.emit(soketsEvents.CharUseSkill, {
      skillId
    });
  }

  userCancelUseSkill(): void {
    this.socket.emit(soketsEvents.CharCancelUseSkill);
  }

}

export {
  Network
};