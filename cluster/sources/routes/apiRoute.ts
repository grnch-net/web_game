import type { FastifyInstance, FastifyReply, FastifySchema } from 'fastify';
import type { ObjectProperties, ObjectSchema } from 'fast-json-stringify';
import type * as mechanics from '../mechanics/index';
import type { WorldData, CharacterWorldData } from '../store';

import * as crypto from 'crypto';

const characterParametersSchema: ObjectSchema = {
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

type CharactersCollect = Associative<mechanics.CharacterParameters>;
const charactersCollect: CharactersCollect = {};

async function apiRoute(
  server: FastifyInstance
): Promise<void> {
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
  
  
  const errorSchema: ObjectProperties = {
    error: {
      type: 'boolean'
    },
    msg: {
      type: 'string'
    },
  };
  
  function sendError(reply: FastifyReply, msg: string) {
    let response_body = {
      error: true,
      msg
    };
    reply.status(210).send(response_body);
  }
  
  function newSchema(
    request: ObjectProperties,
    response: ObjectProperties
  ): FastifySchema {
    return {
      body: {
        type: 'object',
        properties: request
      },
      response: {
        200: {
          type: 'object',
          properties: response
        },
        409: {
          type: 'object',
          properties: errorSchema
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
  
  const characterCreate_RequestBody: ObjectProperties = {
    name: { type: 'string' }
  };
  
  const characterCreate_ResponseBody: ObjectProperties = {
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
      const character_parameters = server.mechanic.createCharacter(body.name);
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
  
  const characterGet_RequsetBody: ObjectProperties = {
    name: { type: 'string' }
  };
  
  const characterGet_ResponseBody: ObjectProperties = {
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
  
  
  interface WorldEnter_Request {
    name: string;
  }
  
  interface WorldEnter_Response {
    secret: string;
    worldIndex: number;
    world: WorldData;
  }
  
  const worldEnter_RequsetBody: ObjectProperties = {
    name: { type: 'string' }
  };
  
  const worldEnter_ResponseBody: ObjectProperties = {
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
      const body = request.body as WorldEnter_Request;
    
      if (server.store.charactersInWorld.includes(body.name)) {
        sendError(reply, 'character_already_exists');
        return;
      }
    
      const character_parameters = charactersCollect[body.name];
      if (!character_parameters) {
        sendError(reply, 'character_not_found');
        return;
      }
    
      const worldIndex = server.mechanic.enterToWorld(character_parameters);
      server.store.charactersInWorld[worldIndex] = body.name;
    
      const secret = generateSecretKey();
      server.store.charactersSecret[secret] = worldIndex;
    
      let response_body: WorldEnter_Response = {
        secret,
        worldIndex,
        world: server.store.world,
      };
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
    
      server.store.world.characters[worldIndex] = charWorldData;
    }
  });
}

export {
  apiRoute
}