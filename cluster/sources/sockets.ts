import type {
  PointParameters
} from './mechanics/point';

import type {
  CharacterWorldData,
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
    logout: NodeJS.Timeout;
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

interface CharMove_InEventData {
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  force?: number;
}

interface CharMove_OutEventData {
  worldIndex: number;
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  force?: number;
}

enum SEvent {
  Connection = 'connection',
  Disconnect = 'disconnect',
  Reconnect = 'reconnect',
  ServerError = 'server:error',
  CharEnter = 'char:enter',
  CharLeave = 'char:leave',
  CharCancelLeave = 'char:cancel-leave',
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
    console.info('Connection', socket.id);
    socket.once(SEvent.CharEnter, (data: CharEnter_InEventData) => this.character_enter_event(socket, data));
  }

  protected character_enter_event(
    socket: Socket,
    data: CharEnter_InEventData
  ): void {    
    const { store } = this.server;
    const character = store.getSecretCharacter(data.secret);
    const worldIndex = character.worldIndex;

    console.info('- Char enter to world', character.name);

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
    socket.on(SEvent.CharLeave, () => this.char_wait_leave(socket));
    socket.on(SEvent.CharCancelLeave, () => this.char_reconnect(socket));
    socket.on(SEvent.Disconnect, () => this.char_wait_leave(socket));
    socket.on(SEvent.Reconnect, () => this.char_reconnect(socket));
    socket.on(SEvent.CharSay, data => this.character_say_event(socket, data));
    socket.on(SEvent.CharRotate, data => this.character_rotate_event(socket, data));
    socket.on(SEvent.CharMove, data => this.character_move(socket, data));
  }

  protected char_reconnect(
    socket: Socket
  ): void {
    clearTimeout(socket.data.logout);
    socket.data.logout = null;
    console.log('Char cancel leave', socket.data.character.name);
  }

  protected async char_wait_leave(
    socket: Socket
  ): Promise<void> {
    if (socket.data.logout) {
      return;
    }
    console.log('Char ready to leave', socket.data.character.name);
    socket.data.logout = setTimeout(() => this.char_leave(socket), 5000);
  }

  protected char_leave(
    socket: Socket
  ): void {
    const { mechanic, store } = this.server;

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
    socket.disconnect();
    console.log('Char leave', socket.data.character.name);
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

  protected character_move(
    socket: Socket,
    data: CharMove_InEventData
  ): void {
    const character = socket.data.character;
    const {
      rotation,
      position,
      direction,
      force
    } = data;
    if (rotation) {
      this.server.mechanic.characterRotate(character, rotation);
      socket.data.characterWorldData.rotation = rotation;
    }
    if (force === 0) {
      this.server.mechanic.characterMoveStop(character, this.parse_position(position));
    } else {
      this.server.mechanic.characterMoveProgress(character, this.parse_position(position), direction, force);    
    }
    const eventData: CharMove_OutEventData = {
      worldIndex: character.worldIndex,
      rotation: rotation,
      position: position,
      direction: direction,
      force: force
    };
    socket.emit(SEvent.CharMove, eventData);
  }

  protected parse_position(
    input?: [number, number, number]
  ): PointParameters {
    if (!input) {
      return null;
    }
    return {
      x: input[0],
      y: input[1],
      z: input[2]
    };
  }

}

export {
  Sockets
};