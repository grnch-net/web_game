import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ObjectProperties } from 'fast-json-stringify';
import type { WorldData, CharacterWorldData } from '../session';

import { APIPlugin, APISchema } from './services/api_plugin';
import { characterWorldData_SchemaProperties } from './services/api_schemas';
import { APIUrl } from './services/api_urls';

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
          id: { type: 'number' },
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
  id: number;
  sessionId: number;
  world: WorldData;
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
    
    if (this.server.store.hasCharacterInWorld(character_name)) {
      this.sendError(reply, 'character_already_exists');
      return;
    }
  
    const session = this.server.store.getOpenSession();
    const character = session.enterToWorld(character_parameters);
    const id = character.id;
    this.server.store.addCharacterInWorld(id, character_name);
  
    const secret = session.createSecretCharacter(character);
  
    let response_body: WorldEnter_ResponseBody = {
      secret,
      id: character.id,
      sessionId: session.id,
      world: session.getWorldData(),
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
      moveForce: character_parameters.moveForce,
      attributes: character_attributes,
      effects: character_effects,
      equips: character_equips
    };
  
    session.addWorldCharacterData(id, charWorldData);
  }

}

export {
  WorldEnter_API
};