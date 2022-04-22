import type {
  FastifyReply,
  FastifyRequest
} from 'fastify';

import type {
  ObjectProperties
} from 'fast-json-stringify';

import type {
  WorldData,
  CharacterWorldData,
  Session
} from '../session';

import {
  APIPlugin,
  APISchema
} from './services/api_plugin';

import {
  characterWorldData_SchemaProperties
} from './services/api_schemas';

import {
  APIUrl
} from './services/api_urls';

import {
  Character
} from '../mechanics/index';

class WorldEnter_APISchema extends APISchema {

  protected override getRequestBody(): ObjectProperties {
    return {
      name: { type: 'string' }
    };
  }

  protected override getResponseBody(): ObjectProperties {
    return {
      data: {
        type: 'object',
        properties: {
          secret: { type: 'string' },
          characterId: { type: 'number' },
          sessionId: { type: 'number' },
          reconnect: { type: 'boolean' },
          world: {
            type: 'object',
            properties: {
              characters: {
                type: 'array',
                items: {
                  type: ['object', 'null'],
                  properties: characterWorldData_SchemaProperties
                }
              }
            }
          }
        }
      }
    };
  }

}

interface WorldEnter_RequestBody {
  name: string;
}

interface WorldEnter_ResponseBody {
  secret: string;
  characterId: number;
  sessionId: number;
  world: WorldData;
  reconnect: boolean;
}

class WorldEnter_API extends APIPlugin {

  protected getAPISchema(): typeof APISchema {
    return WorldEnter_APISchema;
  }

  protected getURL(): string {
    return APIUrl.WorldEnter;
  }

  protected handler(
    request: FastifyRequest,
    reply: FastifyReply
  ): void {    
    const {
      name: character_name
    } = request.body as WorldEnter_RequestBody;    

    const character_parameters = this.server.store.getCharacter(character_name);
    if (!character_parameters) {
      this.sendError(reply, 'character_not_found');
      return;
    }
    
    const character_info = this.server.store.getWorldCharacterInfo(character_name);
    let session: Session;
    let character: Character;
    let reconnect: boolean;

    if (character_info) {
      // this.sendError(reply, 'character_already_exists');
      // return;
      session = this.server.store.getSession(character_info.sessionId);
      character = session.world.getCharacter(character_info.characterId);
      reconnect = true;
    } else {
      session = this.server.store.getOpenSession();
      character = session.enterToWorld(character_parameters);
      this.server.store.addCharacterInWorld(character_name, session.id, character.id);

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
        moveForce: character_parameters.moveForce,
        attributes: character_attributes,
        effects: character_effects,
        equips: character_equips
      };
    
      session.addWorldCharacterData(character.id, charWorldData);
      reconnect = false;
    }

    const secret = session.createSecretCharacter(character);
  
    let response_body: WorldEnter_ResponseBody = {
      secret,
      characterId: character.id,
      sessionId: session.id,
      world: session.getWorldData(),
      reconnect
    };
    reply.send({ data: response_body });
  }

}

export {
  WorldEnter_API
};