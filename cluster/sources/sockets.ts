import type {
  PointParameters
} from './mechanics/point';

import type {
  Session,
  WorldData,
  CharacterWorldData
} from './session';

import type {
  Socket
} from './socket';

import {
  SkillResponseCode
} from './mechanics/skills';

import {
  GamePlugin
} from './services/game_plugin';

import { 
  Server as SocketsServer
} from 'socket.io';
import { Character } from './mechanics';

interface SessionEnter_InEventData {
  name: string;
}

interface WorldEnter_OutEventData {
  characterId: number;
  worldData: WorldData;
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
  SessionEnter ='session:enter',
  SessionCancelFind ='session:cancel-find',
  SessionLeave ='session:leave',
  WorldEnter ='world:enter',
  WorldLeave ='world:leave',
  WorldAction ='world:action',
  CharSay ='char:say',
  CharMove ='char:move',
  CharMoveTo ='char:move-to',
  CharUseSkill ='char:use-skill',
  CharCancelUseSkill ='char:cancel-use-skill',
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
    socket.once(SEvent.SessionEnter, (data) => this.session_enter_event(socket, data));
    socket.once(SEvent.SessionCancelFind, () => this.session_cancel_find_event(socket));
    // socket.once(SEvent.CharEnter, (data) => this.character_enter_event(socket, data));
  }

  protected session_cancel_find_event(
    socket: Socket
  ): void {
    const { store } = this.server;
    const success = store.removeFindCharacter(socket.data.characterName);
    if (success) {
      socket.emit(SEvent.SessionCancelFind);
    }
  }

  protected session_enter_event(
    socket: Socket,
    data: SessionEnter_InEventData
  ): void {
    const { store } = this.server;

    socket.data.characterName = data.name;

    store.addSocket(data.name, socket);
    const character_info = store.getCharacterInfo(data.name);

    if (character_info) {
      const { sessionId, characterId } = character_info;
      this.reconnect_character(sessionId, characterId);
      return;
    }

    store.addFindCharacter(data.name);
    this.start_session();
  }

  protected reconnect_character(
    sessionId: number,
    characterId: number
  ): void {    
    const { store } = this.server;
    const session = store.getSession(sessionId);
    const character = session.world.characters.elements[characterId];
    const socket = store.getSocket(character.name);
    
    console.info('- Char enter to world', character.name);
    
    this.socket_world_enter(session, socket, character);

    const event_data: WorldEnter_OutEventData = {
      characterId: character.id,
      worldData: session.getWorldData()
    };
    socket.emit(SEvent.WorldEnter, event_data);

    // const event_data: CharEnter_OutEventData = {
    //   id: characterId,
    // };

    // for (const session_socket of session.sockets) {
    //   if (session_socket === socket) {
    //     continue;
    //   }
    //   session_socket.emit(SEvent.CharEnter, event_data);
    // }
  }

  protected socket_world_enter(
    session: Session,
    socket: Socket,
    character: Character,
  ): void {
    const characterWorldData = session.getWorldCharacterData(character.id);
    
    socket.data.character = character;
    socket.data.characterWorldData = characterWorldData;
    socket.data.session = session;
    session.addSocket(character.id, socket);
    this.add_socket_listeners(socket);
  }

  protected start_session(): void {
    const { store } = this.server;
    const session_characters_count = 2;
    const character_find = store.getFindCharacters();

    if (character_find.length < session_characters_count) {
      return;
    }

    const session = store.createSession();

    for (let index = 0; index < session_characters_count; index++) {
      const character_name = character_find.shift();
      store.removeFindCharacter(character_name);

      const character_parameters = store.getCharacter(character_name);
      const character = session.enterToWorld(character_parameters);
      store.addCharacterInfo(character_name, session.id, character.id);
    }
    
    session.runWorld();

    for (const character of session.world.characters.elements) {
      if (!character) {
        continue;
      }
      const socket = store.getSocket(character.name);
      this.socket_world_enter(session, socket, character);
    }
    
    const world_data = session.getWorldData();
    for (const socket of session.sockets) {
      const character_name = socket.data.characterName;

      const event_data: WorldEnter_OutEventData = {
        characterId: socket.data.character.id,
        worldData: world_data
      };
      socket.emit(SEvent.WorldEnter, event_data);
    }
  }

  protected add_socket_listeners(
    socket: Socket,
  ): void {
    // socket.on(SEvent.CharLeave, () => this.char_wait_leave(socket));
    // socket.on(SEvent.CharCancelLeave, () => this.char_reconnect(socket));
    // socket.on(SEvent.Disconnect, () => this.char_wait_leave(socket));
    // socket.on(SEvent.CharLeave, () => this.char_leave(socket));
    socket.on(SEvent.Disconnect, () => this.char_leave(socket));
    
    // socket.on(SEvent.Reconnect, () => this.char_reconnect(socket));
    socket.on(SEvent.CharSay, data => this.character_say_event(socket, data));
    socket.on(SEvent.CharMove, data => this.character_move(socket, data));
    socket.on(SEvent.CharMoveTo, data => this.character_move_to(socket, data));
    socket.on(SEvent.CharUseSkill, data => this.character_use_skill(socket, data));
    socket.on(SEvent.CharCancelUseSkill, () => this.character_cancel_use_skill(socket));

    socket.data.session.world.addActionListener(result => {
      socket.emit(SEvent.WorldAction, result);
    });
  }

  // protected char_reconnect(
  //   socket: Socket
  // ): void {
  //   clearTimeout(socket.data.logout);
  //   socket.data.logout = null;
  //   console.log('Char cancel leave', socket.data.character.name);
  // }

  // protected async char_wait_leave(
  //   socket: Socket
  // ): Promise<void> {
  //   if (socket.data.logout) {
  //     return;
  //   }

  //   const character = socket.data.character;
  //   character.moveStop();

  //   const event_data: CharMove_OutEventData = {
  //     id: character.id,
  //     position: character.position.toArray(),
  //     forcePercent: 0
  //   };
  //   // TODO: remove emit all sockets
  //   this.io.sockets.emit(SEvent.CharMove, event_data);

  //   console.log('Char ready to leave', socket.data.character.name);
  //   socket.data.logout = setTimeout(() => this.char_leave(socket), 5000);
  // }

  protected char_leave(
    socket: Socket
  ): void {
    // const { store } = this.server;

    // const id = socket.data.character.id;
    // const success = socket.data.session.leaveFromWorld(id);

    // if (!success) {
    //   socket.send(SEvent.ServerError, SEvent.CharLeave);
    //   return;
    // }
    
    // store.removeWorldCharacter(id);
    
    // const event_data: CharLeave_OutEventData = {
    //   id
    // };
    // // TODO: remove emit all sockets
    // this.io.sockets.emit(SEvent.CharLeave, event_data);
      
    socket.removeAllListeners();
    socket.disconnect();
    console.log('Char leave', socket.data.character.name);
  }

  protected character_say_event(
    socket: Socket,
    data: CharSay_InEventData
  ): void {
    console.info('Char say', data);
    const session = socket.data.session;
    const event_data: CharSay_OutEventData = {
      id: socket.data.character.id,
      message: data.message
    };
    for (const session_socket of session.sockets) {
      session_socket.emit(SEvent.CharSay, event_data);
    }
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

    const session = socket.data.session;
    const event_data: CharMove_OutEventData = {
      id: character.id,
      rotation: rotation,
      position: position,
      direction: direction,
      forcePercent
    };

    for (const session_socket of session.sockets) {
      if (session_socket === socket) {
        continue;
      }
      session_socket.emit(SEvent.CharMove, event_data);
    }
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

    const session = socket.data.session;
    const event_data: CharMove_OutEventData = {
      id: character.id,
      rotation: rotation,
      position: position
    };

    for (const session_socket of session.sockets) {
      if (session_socket === socket) {
        continue;
      }
      session_socket.emit(SEvent.CharMoveTo, event_data);
    }
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
      const session = socket.data.session;
      const event_data: CharUseSkill_OutEventData = {
        id: character.id,
        skillId
      };
      for (const session_socket of session.sockets) {
        if (session_socket === socket) {
          continue;
        }
        session_socket.emit(SEvent.CharUseSkill, event_data);
      }
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
      const session = socket.data.session;
      const event_data: CharCancelUseSkill_OutEventData = {
        id: character.id
      };

      for (const session_socket of session.sockets) {
        if (session_socket === socket) {
          continue;
        }
        session_socket.emit(SEvent.CharCancelUseSkill, event_data);
      }
    }
  }

  protected start_game_session(): void {

  }

}

export {
  Sockets
};