import type {
  CharacterWorldData
} from './store';

import {
  GamePlugin
} from './services/game_plugin';

import { 
  Server as SocketServer,
  Socket
} from 'socket.io';

interface CharEnter_InEventData {
  secret: string;
}

interface CharEnter_OutEventData {
  worldIndex: number,
  characterData: CharacterWorldData
}

interface CharLeave_OutEventData {
  worldIndex: number
}

enum SEvent {
  ServerError = 'server:error',
  CharEnter = 'char:enter',
  CharLeave = 'char:leave',
  CharSay = 'char:say',
  CharMove = 'char:move',
  CharUseSkill = 'char:use-skill'
}

class Sockets extends GamePlugin {

  protected io: SocketServer;

  override initializePlugin(): void {
    this.initialize_socket();
    this.initialize_handlers();
  }

  protected initialize_socket(): void {
    const options = {
      serveClient: false
    };
    this.io = new SocketServer(this.server.server, options);
    this.server.addHook('onClose', async() => {
      this.io.close()
    });
  }

  protected initialize_handlers(): void {
    this.server.ready(err => {
      if (err) {
        throw err;
      }
      this.io.on('connection', socket => this.connection_handler(socket));
    });
  }

  protected connection_handler(socket: Socket): void {
    console.info('New player connection', socket.id);
      
    socket.on(SEvent.CharEnter, (data: CharEnter_InEventData) => this.character_enter_event(socket, data));

    socket.on(SEvent.CharLeave, () => this.charLeave(socket));
    socket.on('disconnect', () => this.charLeave(socket));
    
    socket.on(SEvent.CharSay, data => this.character_say_event(data));
  }

  protected character_enter_event(
    socket: Socket,
    data: CharEnter_InEventData
  ): void {
    const { store } = this.server;

    const worldIndex = store.getSecretIndex(data.secret);
    socket.data.worldIndex = worldIndex;

    store.addSocketsId(worldIndex, socket.id);

    const eventData: CharEnter_OutEventData = {
      worldIndex,
      characterData: store.getWorldCharacterData(worldIndex)
    };
    socket.broadcast.emit(SEvent.CharEnter, eventData);
  }

  protected async charLeave(socket: Socket): Promise<void> {
    const { mechanic, store } = this.server;

    await UTILS.wait(10);

    const worldIndex = socket.data.worldIndex;
    const success = mechanic.leaveFromWorld(worldIndex);

    if (!success) {
      socket.send(SEvent.ServerError, SEvent.CharLeave);
      return;
    }

    store.removeWorldCharacter(worldIndex);

    const eventData: CharLeave_OutEventData = {
      worldIndex
    };
    this.io.emit(SEvent.CharLeave, eventData);
  }

  protected character_say_event(data: any): void {
    console.info('Char say', data);
    this.io.emit(SEvent.CharSay, data);
  }

}

export {
  Sockets
};