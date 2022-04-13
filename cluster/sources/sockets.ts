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
  SkillResponseCode
} from './mechanics/skills';

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

interface CharMove_InEventData {
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  forcePercent?: number;
}

interface CharMove_OutEventData {
  worldIndex: number;
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  forcePercent?: number;
}

interface CharUseSkill_InEventData {
  skillId: number;
}

interface CharUseSkill_OutEventData {
  worldIndex: number;
  skillId: number;
}

interface CharCancelUseSkill_InEventData {}

interface CharCancelUseSkill_OutEventData {
  worldIndex?: number;
  code?: number;
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
  CharMove = 'char:move',
  CharUseSkill = 'char:use-skill',
  CharCancelUseSkill = 'char:cancel-use-skill',
  WorldAction = 'world:action'
}

class Sockets extends GamePlugin {

  protected io: SocketsServer;

  override initializePlugin(): void {
    this.initialize_socket();
    this.initialize_handlers();
  }

  protected initialize_socket(): void {
    const options = {
      serveClient: false,
      cors: {
        origin: '*',
      }
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
    const worldIndex = character?.worldIndex;

    if (worldIndex == undefined) {
      socket.disconnect();
      return;
    }
    
    console.info('- Char enter to world', character.name);
    
    const characterWorldData = store.getWorldCharacterData(worldIndex);
    
    socket.data.character = character;
    socket.data.characterWorldData = characterWorldData;
    store.addSocketsId(worldIndex, socket.id);

    const event_data: CharEnter_OutEventData = {
      worldIndex,
      characterData: characterWorldData
    };
    socket.broadcast.emit(SEvent.CharEnter, event_data);

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
    socket.on(SEvent.CharMove, data => this.character_move(socket, data));
    socket.on(SEvent.CharUseSkill, data => this.character_use_skill(socket, data));
    socket.on(SEvent.CharCancelUseSkill, () => this.character_cancel_use_skill(socket));

    this.server.mechanic.addActionListener(result => {
      socket.emit(SEvent.WorldAction, result);
    });
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

    const character = socket.data.character;
    character.moveStop();

    const event_data: CharMove_OutEventData = {
      worldIndex: character.worldIndex,
      position: character.position.toArray(),
      forcePercent: 0
    };
    this.io.sockets.emit(SEvent.CharMove, event_data);

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

    const event_data: CharLeave_OutEventData = {
      worldIndex
    };

    this.io.sockets.emit(SEvent.CharLeave, event_data);
    socket.disconnect();
    console.log('Char leave', socket.data.character.name);
  }

  protected character_say_event(
    socket: Socket,
    data: CharSay_InEventData
  ): void {
    console.info('Char say', data);
    const event_data: CharSay_OutEventData = {
      worldIndex: socket.data.character.worldIndex,
      message: data.message
    };
    this.io.sockets.emit(SEvent.CharSay, event_data);
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
      forcePercent
    } = data;

    if (UTILS.types.isNumber(rotation)) {
      character.rotate(rotation);
      socket.data.characterWorldData.rotation = rotation;
    }

    if (forcePercent === 0) {
      character.moveStop();
    } else
    if (forcePercent) {
      character.moveProgress(forcePercent, direction);
    }

    if (position) {
      character.updatePosition(this.parse_position(position));
    }

    const event_data: CharMove_OutEventData = {
      worldIndex: character.worldIndex,
      rotation: rotation,
      position: position,
      direction: direction,
      forcePercent
    };
    socket.broadcast.emit(SEvent.CharMove, event_data);
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

  protected character_use_skill(
    socket: Socket,
    data: CharUseSkill_InEventData
  ): void {
    const {
      skillId
    } = data;
    const character = socket.data.character;
    const event_code = character.useSkill(skillId);

    if (event_code === SkillResponseCode.Success) {
      const event_data: CharUseSkill_OutEventData = {
        worldIndex: character.worldIndex,
        skillId
      };
      socket.broadcast.emit(SEvent.CharUseSkill, event_data);
    } else
    if (event_code === SkillResponseCode.SuccessInstantly) {
      // Skip
    } else {
      const event_data: CharCancelUseSkill_OutEventData = {
        code: event_code
      };
      socket.emit(SEvent.CharCancelUseSkill, event_data);
    }
  }

  protected character_cancel_use_skill(
    socket: Socket
  ): void {
    const character = socket.data.character;
    const event_code = character.cancelUseSkill();

    if (event_code === 0) {
      const event_data: CharCancelUseSkill_OutEventData = {
        worldIndex: character.worldIndex
      };
      socket.broadcast.emit(SEvent.CharCancelUseSkill, event_data);
    }
  }

}

export {
  Sockets
};