import type {
  PointParameters
} from './mechanics/point';

import type {
  Session,
  CharacterWorldData
} from './session';

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
    session: Session;
  }
}

interface CharEnter_InEventData {
  secret: string;
  sessionId: number;
}

interface CharEnter_OutEventData {
  id: number;
  characterData: CharacterWorldData;
}

interface CharLeave_OutEventData {
  id: number;
}

interface CharSay_InEventData {
  message: string;
}

interface CharSay_OutEventData {
  id: number;
  message: string;
}

interface CharMove_InEventData {
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  forcePercent?: number;
}

interface CharMove_OutEventData {
  id: number;
  direction?: number;
  rotation?: number;
  position?: [number, number, number];
  forcePercent?: number;
}

interface CharUseSkill_InEventData {
  skillId: number;
}

interface CharUseSkill_OutEventData {
  id: number;
  skillId: number;
}

interface CharCancelUseSkill_InEventData {}

interface CharCancelUseSkill_OutEventData {
  id?: number;
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
  CharMoveTo = 'char:move-to',
  CharUseSkill = 'char:use-skill',
  CharCancelUseSkill = 'char:cancel-use-skill',
  WorldStart = 'world:start',
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

    const session = store.getSession(data.sessionId);
    const character = session.getSecretCharacter(data.secret);
    const id = character?.id;

    if (id == undefined) {
      socket.disconnect();
      return;
    }
    
    console.info('- Char enter to world', character.name);
    
    const characterWorldData = session.getWorldCharacterData(id);
    
    socket.data.character = character;
    socket.data.characterWorldData = characterWorldData;
    socket.data.session = session;
    session.addSocketsId(id, socket.id);

    const event_data: CharEnter_OutEventData = {
      id,
      characterData: characterWorldData
    };
    socket.broadcast.emit(SEvent.CharEnter, event_data);

    this.add_socket_listeners(socket);
    this.check_start_session(session);
  }

  protected add_socket_listeners(
    socket: Socket,
  ): void {
    socket.on(SEvent.CharLeave, () => this.char_wait_leave(socket));
    socket.on(SEvent.CharCancelLeave, () => this.char_reconnect(socket));
    socket.on(SEvent.Disconnect, () => this.char_wait_leave(socket));
    socket.on(SEvent.Reconnect, () => this.char_reconnect(socket));
    socket.on(SEvent.CharSay, data => this.character_say_event(socket, data));
    socket.on(SEvent.CharMove, data => this.character_move(socket, data));
    socket.on(SEvent.CharMoveTo, data => this.character_move_to(socket, data));
    socket.on(SEvent.CharUseSkill, data => this.character_use_skill(socket, data));
    socket.on(SEvent.CharCancelUseSkill, () => this.character_cancel_use_skill(socket));

    socket.data.session.world.addActionListener(result => {
      socket.emit(SEvent.WorldAction, result);
    });
  }

  protected check_start_session(
    session: Session
  ): void {
    if (session.isFull()) {
      session.runWorld();
    }
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
      id: character.id,
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
    const { store } = this.server;

    const id = socket.data.character.id;
    const success = socket.data.session.leaveFromWorld(id);

    if (!success) {
      socket.send(SEvent.ServerError, SEvent.CharLeave);
      return;
    }
    
    socket.removeAllListeners();
    store.removeWorldCharacter(id);
    
    const event_data: CharLeave_OutEventData = {
      id
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
      id: socket.data.character.id,
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
      id: character.id,
      rotation: rotation,
      position: position,
      direction: direction,
      forcePercent
    };
    socket.broadcast.emit(SEvent.CharMove, event_data);
  }

  protected character_move_to(
    socket: Socket,
    data: CharMove_InEventData
  ): void {
    const character = socket.data.character;
    const {
      rotation,
      position
    } = data;

    if (UTILS.types.isNumber(rotation)) {
      character.rotate(rotation);
      socket.data.characterWorldData.rotation = rotation;
    }

    if (position) {
      character.updatePosition(this.parse_position(position));
    }

    const event_data: CharMove_OutEventData = {
      id: character.id,
      rotation: rotation,
      position: position
    };
    socket.broadcast.emit(SEvent.CharMoveTo, event_data);
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
        id: character.id,
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
        id: character.id
      };
      socket.broadcast.emit(SEvent.CharCancelUseSkill, event_data);
    }
  }

  protected start_game_session(): void {

  }

}

export {
  Sockets
};