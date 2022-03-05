import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ObjectProperties } from 'fast-json-stringify';
import type { WorldData, CharacterWorldData } from '../store';

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
          worldIndex: { type: 'number' },
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
  worldIndex: number;
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
    const { store, mechanic } = this.server;
    
    const {
      name: character_name
    } = request.body as WorldEnter_RequestBody;    

    if (store.hasCharacterInWorld(character_name)) {
      this.sendError(reply, 'character_already_exists');
      return;
    }
  
    const character_parameters = store.getCharacter(character_name);
    if (!character_parameters) {
      this.sendError(reply, 'character_not_found');
      return;
    }
  
    const character = mechanic.enterToWorld(character_parameters);
    const worldIndex = character.worldIndex;
    store.addCharacterInWorld(worldIndex, character_name);
  
    const secret = store.createSecretCharacter(character);
  
    let response_body: WorldEnter_ResponseBody = {
      secret,
      worldIndex,
      world: store.getWorldData(),
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
  
    store.addWorldCharacterData(worldIndex, charWorldData);
  }

}

export {
  WorldEnter_API
};