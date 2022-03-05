import type {
  CharacterWorldData,
  Position
} from './store';

import {
  Character
} from './mechanics/index';


import {
  GamePlugin
} from './services/game_plugin';

import { 
  Server as SocketsServer,
  Socket as ioSocket
} from 'socket.io';

interface Socket extends ioSocket {
  data: {
    character: Character;
    characterWorldData: CharacterWorldData;
  }
}

interface CharEnter_InEventData {
  secret: string;
}

interface CharEnter_OutEventData {
  worldIndex: number;
  characterData: CharacterWorldData;
}

interface CharLeave_OutEventData {
  worldIndex: number;
}

interface CharSay_InEventData {
  message: string;
}

interface CharSay_OutEventData {
  worldIndex: number;
  message: string;
}

interface CharRotate_InEventData {
  rotation: number;
}

interface CharRotate_OutEventData {
  worldIndex: number;
  rotation: number;
}

interface CharMoveStart_InEventData {
  direction: number;
}

interface CharMoveStart_OutEventData {
  worldIndex: number;
  direction: number;
  // position: Position;
}

interface CharMoveStop_InEventData {}

interface CharMoveStop_OutEventData {
  worldIndex: number;
}

enum SEvent {
  Connection = 'connection',
  Disconnect = 'disconnect',
  ServerError = 'server:error',
  CharEnter = 'char:enter',
  CharLeave = 'char:leave',
  CharSay = 'char:say',
  CharRotate = 'char:rotate',
  CharMove = 'char:move',
  CharUseSkill = 'char:use-skill'
}

class Sockets extends GamePlugin {

  protected io: SocketsServer;

  override initializePlugin(): void {
    this.initialize_socket();
    this.initialize_handlers();
  }

  protected initialize_socket(): void {
    const options = {
      serveClient: false
    };
    this.io = new SocketsServer(this.server.server, options);
    this.server.addHook('onClose', async() => {
      this.io.close()
    });
  }

  protected initialize_handlers(): void {
    // this.server.ready(err => {
    //   if (err) {
    //     throw err;
    //   }
    // });
    this.io.on(SEvent.Connection, socket => this.connection_handler(socket));
  }

  protected connection_handler(
    socket: Socket
  ): void {
    console.info('New player connection', socket.id);
    socket.once(SEvent.CharEnter, (data: CharEnter_InEventData) => this.character_enter_event(socket, data));
  }

  protected character_enter_event(
    socket: Socket,
    data: CharEnter_InEventData
  ): void {    
    const { store } = this.server;
    const character = store.getSecretCharacter(data.secret);
    const worldIndex = character.worldIndex;

    if (worldIndex == undefined) {
      socket.disconnect();
      return;
    }
    
    const characterWorldData = store.getWorldCharacterData(worldIndex);
    
    socket.data.character = character;
    socket.data.characterWorldData = characterWorldData;
    store.addSocketsId(worldIndex, socket.id);

    const eventData: CharEnter_OutEventData = {
      worldIndex,
      characterData: characterWorldData
    };
    socket.broadcast.emit(SEvent.CharEnter, eventData);

    this.add_socket_listeners(socket);
  }

  protected add_socket_listeners(
    socket: Socket
  ): void {
    socket.on(SEvent.CharLeave, () => this.char_leave(socket));
    socket.on(SEvent.Disconnect, () => this.char_leave(socket));
    socket.on(SEvent.CharSay, data => this.character_say_event(socket, data));
  }

  protected async char_leave(
    socket: Socket
  ): Promise<void> {
    const { mechanic, store } = this.server;

    await UTILS.wait(10);

    const worldIndex = socket.data.character.worldIndex;
    const success = mechanic.leaveFromWorld(worldIndex);

    if (!success) {
      socket.send(SEvent.ServerError, SEvent.CharLeave);
      return;
    }

    socket.removeAllListeners();
    store.removeWorldCharacter(worldIndex);

    const eventData: CharLeave_OutEventData = {
      worldIndex
    };
    socket.emit(SEvent.CharLeave, eventData);
  }

  protected character_say_event(
    socket: Socket,
    data: CharSay_InEventData
  ): void {
    console.info('Char say', data);
    const eventData: CharSay_OutEventData = {
      worldIndex: socket.data.character.worldIndex,
      message: data.message
    };
    socket.emit(SEvent.CharSay, eventData);
  }

  protected character_rotate_event(
    socket: Socket,
    data: CharRotate_InEventData
  ): void {
    const character = socket.data.character;
    this.server.mechanic.characterRotate(character, data.rotation);
    socket.data.characterWorldData.rotation = data.rotation;

    const eventData: CharRotate_OutEventData = {
      worldIndex: socket.data.character.worldIndex,
      rotation: data.rotation
    };
    socket.emit(SEvent.CharRotate, eventData);
  }

  protected character_move_start_event(
    socket: Socket,
    data: CharMoveStart_InEventData
  ): void {
    const character = socket.data.character;
    this.server.mechanic.characterMoveStart(character, data.direction);

    const eventData: CharMoveStart_OutEventData = {
      worldIndex: socket.data.character.worldIndex,
      direction: data.direction,
    };
    socket.emit(SEvent.CharMove, eventData);
  }

  protected character_move_stop_event(
    socket: Socket,
    data: CharMoveStop_InEventData
  ): void {
    const character = socket.data.character;
    this.server.mechanic.characterMoveStop(character);

    const eventData: CharMoveStop_OutEventData = {
      worldIndex: socket.data.character.worldIndex,
    };
    socket.emit(SEvent.CharMove, eventData);
  }

}

export {
  Sockets
};