import type {
  Game,
  CharacterData,
  WorldData
} from './game';

import {
  io,
  Socket
} from 'socket.io-client';


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
  CharUseSkill: 'char:use-skill'
};

interface EnterData {
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
    data.world.userIndex = data.worldIndex;
    this.create_socket();
    this.enter_to_world_emit(data.secret);
    return data.world;
  }

  protected async enter_to_world_request(
    characterName: string
  ): Promise<EnterData> {
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

  protected async send_request(url, data) {
    const response = await fetch(url, {
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

    return response.data;
  }

  protected create_socket(): void {
    this.socket = io();
    this.initialize_socket_events();
  }

  protected initialize_socket_events(): void {
    this.socket.on(soketsEvents.CharSay, data => {
      GAME.newMessage(data.worldIndex, data.message);
    });

    this.socket.on(soketsEvents.CharMove, data => {
      // this.charMoveHandler(data)
    });

    this.socket.on(soketsEvents.CharUseSkill, data => {
      console.log('Char use skill', data);
    });

    this.socket.on(soketsEvents.CharEnter, data => {
      console.log('Char enter to world', data);
      // this.worldData.characters[data.worldIndex] = data.characterData;
      // this.updateWorldCharactersList();
      // this.addCharacter(data.worldIndex, data.characterData);
    });

    this.socket.on(soketsEvents.CharLeave, data => {  
      // if (this.worldIndex == data.worldIndex) {
      //   console.warn('Your char leave from world');
      //   this.socket.disconnect();
      //   this.destroyWorld();
      //   return;
      // }

      // this.removeCharacter(data.worldIndex);
    });
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

}

export {
  Network
};