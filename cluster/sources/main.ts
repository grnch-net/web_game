import './utils/index';
import * as mechanics from './mechanics/index';

// import './utils/tests/index';
// import './mechanics/tests/index';

import { join } from 'path';
import { promises as fs } from 'fs';
import Fastify, { FastifyReply, FastifySchema } from 'fastify';
import SocketIO from 'fastify-socket.io';
import FastifyStatic from 'fastify-static';
import * as crypto from 'crypto';

const server = Fastify({
  logger: true
});

const mechanic = new mechanics.Mechanic;
mechanic.initialize();

type CharactersCollect = Associative<mechanics.CharacterParameters>;
const charactersCollect: CharactersCollect = {};

interface Position {
  x: number;
  y: number;
  z: number;
}
interface CharacterWorldData {
  name: string;
  position: Position;
  rotation: number;
  attributes: Associative<number>;
  effects: number[];
  equips: number[];
}
interface WorldData {
  characters: CharacterWorldData[]
}

const worldData: WorldData = {
  characters: []
};
const socketsId: string[] = [];
const charactersInWorld: string[] = [];
const charactersSecret: { [secret: string]: number } = {};


const characterParametersSchema = {
  type: 'object',
  additionalProperties: true // TODO:
}

const characterWorldDataSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    position: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        z: { type: 'number' },
      }
    },
    rotation: { type: 'number' },
    attributes: {
      type: 'object',
      additionalProperties: {
        type: 'number'
      }
    },
    effects: {
      type: 'array',
      items: { type: ['number', 'null'] }
    },
    equips: {
      type: 'array',
      items: { type: ['number', 'null'] }
    }
  }
};

// View
server.get('/', async (request, reply) => {
  const data = await fs.readFile(join(__dirname, '../client', 'index.html'))
  reply.header('content-type', 'text/html; charset=utf-8')
  reply.send(data)
});

server.register(FastifyStatic, {
  root: join(__dirname, '../client/src'),
  prefix: '/src/',
});


enum APIEvent {
  CharacterCreate = '/character-create',
  CharacterGet = '/character-get',
  WorldEnter = '/world-enter'
}

enum SEvent {
  ServerError = 'server:error',
  CharEnter = 'char:enter',
  CharLeave = 'char:leave',
  CharSay = 'char:say',
  CharMove = 'char:move',
  CharUseSkill = 'char:use-skill'
}


const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'boolean'
    },
    msg: {
      type: 'string'
    },
  }
};

function sendError(reply: FastifyReply, msg: string) {
  let response_body = {
    error: true,
    msg
  };
  reply.send(response_body);
}

function newSchema(request, response): FastifySchema {
  return {
    body: {
      type: 'object',
      properties: request
    },
    response: {
      200: {
        type: 'object',
        properties: response
      }
    }
  };
}

interface CharacterCreateRequest {
  name: string;
}

interface CharacterCreateResponse {
  parameters: mechanics.CharacterParameters;
}

const characterCreate_RequestBody = {
  name: { type: 'string' }
};

const characterCreate_ResponseBody = {
  data: {
    type: 'object',
    properties: {
      parameters: characterParametersSchema
    }
  }
};

const characterCreate_Schema = newSchema(characterCreate_RequestBody, characterCreate_ResponseBody);

server.post(APIEvent.CharacterCreate, {
  schema: characterCreate_Schema,
  handler: (request, reply) => {
    const body = request.body as CharacterCreateRequest;
    if (charactersCollect[body.name]) {
      sendError(reply, 'name_is_taken');
      return;
    }
    const character_parameters = mechanic.createCharacter(body.name);
    charactersCollect[body.name] = character_parameters;
    let response_body: CharacterCreateResponse = {
      parameters: character_parameters
    };
    reply.send({ data: response_body });
  }
});


interface CharacterGetRequest {
  name: string;
}

interface CharacterGetResponse {
  parameters: mechanics.CharacterParameters;
}

const characterGet_RequsetBody = {
  name: { type: 'string' }
};

const characterGet_ResponseBody = {
  data: {
    type: 'object',
    properties: {
      parameters: characterParametersSchema
    }
  }
};

const characterGet_Schema = newSchema(characterGet_RequsetBody, characterGet_ResponseBody);

server.post(APIEvent.CharacterGet, {
  schema: characterGet_Schema,
  handler: (request, reply) => {
    const body = request.body as CharacterGetRequest;
    const character_parameters = charactersCollect[body.name];
    if (!character_parameters) {
      sendError(reply, 'character_not_found');
      return;
    }
    let response_body: CharacterGetResponse = {
      parameters: character_parameters
    };
    reply.send({ data: response_body });
  }
});


interface WorldEnterRequest {
  name: string;
}

interface WorldEnterResponse {
  secret: string;
  worldIndex: number;
  world: WorldData;
}

const worldEnter_RequsetBody = {
  name: { type: 'string' }
};

const worldEnter_ResponseBody = {
  data: {
    type: 'object',
    properties: {
      secret: { type: 'string' },
      worldIndex: { type: 'number' },
      world: {
        type: 'object',
        properties: {
          characters: {
            type: 'array',
            items: {
              ...characterWorldDataSchema,
              type: ['object', 'null']
            }
          }
        }
      }
    }
  }
};

const worldEnter_Schema = newSchema(worldEnter_RequsetBody, worldEnter_ResponseBody);

function generateSecretKey(): string {
  return crypto.randomBytes(10).toString('hex');
}

server.post(APIEvent.WorldEnter, {
  schema: worldEnter_Schema,
  handler: (request, reply) => {
    const body = request.body as WorldEnterRequest;
    console.warn(body);
  
    if (charactersInWorld.includes(body.name)) {
      sendError(reply, 'character_already_exists');
      return;
    }
  
    const character_parameters = charactersCollect[body.name];
    if (!character_parameters) {
      sendError(reply, 'character_not_found');
      return;
    }
  
    const worldIndex = mechanic.enterToWorld(character_parameters);
    charactersInWorld[worldIndex] = body.name;
  
    const secret = generateSecretKey();
    charactersSecret[secret] = worldIndex;
  
    let response_body: WorldEnterResponse = {
      secret,
      worldIndex,
      world: worldData,
    };
    console.log(worldData);
    reply.send({ data: response_body });
    
    const character_attributes: Associative<number> = {};
    for (const key in character_parameters.attributes) {
      const attribute = character_parameters.attributes[key];
      character_attributes[key] = attribute.value;
    }
  
    const character_effects: number[] = [];
    for (const effect of character_parameters.effects) {
      character_effects.push(effect.id as number);
    }
  
    const character_equips: number[] = [];
    for (const equip of character_parameters.equips) {
      character_equips.push(equip.id as number);
    }
  
    const charWorldData: CharacterWorldData = {
      name: character_parameters.name,
      position: character_parameters.position,
      rotation: character_parameters.rotation,
      attributes: character_attributes,
      effects: character_effects,
      equips: character_equips
    };
  
    worldData.characters[worldIndex] = charWorldData;
  }
});

// Live
server.register(SocketIO, {
  serveClient: false
});

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

server.ready(err => {
  if (err) {
    throw err;
  }

  server.io.on('connection', socket => {
    console.info('New player connection', socket.id);
    
    socket.on(SEvent.CharEnter, (data: CharEnter_InEventData) => {
      const worldIndex = charactersSecret[data.secret];
      socket.data.worldIndex = worldIndex;
      delete charactersSecret[data.secret];

      socketsId[worldIndex] = socket.id;

      const eventData: CharEnter_OutEventData = {
        worldIndex,
        characterData: worldData.characters[worldIndex]
      };
      socket.broadcast.emit(SEvent.CharEnter, eventData);
    });

    async function charLeave() {
      await UTILS.wait(10);

      const worldIndex = socket.data.worldIndex;
      const success = mechanic.leaveFromWorld(worldIndex);

      if (!success) {
        socket.send(SEvent.ServerError, SEvent.CharLeave);
        return;
      }

      worldData.characters[worldIndex] = null;
      charactersInWorld[worldIndex] = null;
      socketsId[worldIndex] = null;

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


// Run
server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});
