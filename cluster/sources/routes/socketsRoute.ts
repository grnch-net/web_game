import type { FastifyInstance } from 'fastify';
import type { CharacterWorldData } from '../store';

import fastifySocketIO from 'fastify-socket.io';

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

async function socketsRoute(
  server: FastifyInstance
): Promise<void> {
  server.register(fastifySocketIO, {
    serveClient: false
  });
  
  server.ready(err => {
    if (err) {
      throw err;
    }
  
    server.io.on('connection', socket => {
      console.info('New player connection', socket.id);
      
      socket.on(SEvent.CharEnter, (data: CharEnter_InEventData) => {
        const worldIndex = server.store.charactersSecret[data.secret];
        socket.data.worldIndex = worldIndex;
        delete server.store.charactersSecret[data.secret];
  
        server.store.socketsId[worldIndex] = socket.id;
  
        const eventData: CharEnter_OutEventData = {
          worldIndex,
          characterData: server.store.world.characters[worldIndex]
        };
        socket.broadcast.emit(SEvent.CharEnter, eventData);
      });
  
      async function charLeave() {
        await UTILS.wait(10);
  
        const worldIndex = socket.data.worldIndex;
        const success = server.mechanic.leaveFromWorld(worldIndex);
  
        if (!success) {
          socket.send(SEvent.ServerError, SEvent.CharLeave);
          return;
        }
  
        server.store.world.characters[worldIndex] = null;
        server.store.charactersInWorld[worldIndex] = null;
        server.store.socketsId[worldIndex] = null;
  
        const eventData: CharLeave_OutEventData = {
          worldIndex
        };
        server.io.emit(SEvent.CharLeave, eventData);
      }
  
      socket.on(SEvent.CharLeave, () => charLeave());
      socket.on('disconnect', () => charLeave());
      
      socket.on(SEvent.CharSay, data => {
        console.info('Char say', data);
        server.io.emit(SEvent.CharSay, data);
      });
    });
  });
}

export {
  socketsRoute
};