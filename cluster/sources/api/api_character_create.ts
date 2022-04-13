import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ObjectProperties } from 'fast-json-stringify';
import type * as mechanics from '../mechanics/index';

import { APIPlugin, APISchema } from './services/api_plugin';
import { characterParameters_SchemaObject } from './services/api_schemas';
import { APIUrl } from './services/api_urls';

class CreateCharacret_APISchema extends APISchema {

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
          parameters: characterParameters_SchemaObject
        }
      }
    };
  }

}

interface CharacterCreate_RequestBody {
  name: string;
}

interface CharacterCreate_ResponseBody {
  parameters: mechanics.CharacterParameters;
}

class CharacretCreate_API extends APIPlugin {

  protected getAPISchema(): typeof APISchema {
    return CreateCharacret_APISchema;
  }

  protected getURL(): string {
    return APIUrl.CharacterCreate;
  }

  protected handler(
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    const { store, mechanic } = this.server;
    
    const {
      name: character_name
    } = request.body as CharacterCreate_RequestBody;

    if (!character_name) {
      this.sendError(reply, 'wrong_name');
      return
    }

    if (store.hasCharacter(character_name)) {
      this.sendError(reply, 'name_is_taken');
      return;
    }

    const character_parameters = mechanic.createCharacterConfig(character_name);
    store.addNewCharacter(character_name, character_parameters);

    let response_body: CharacterCreate_ResponseBody = {
      parameters: character_parameters
    };
    reply.send({ data: response_body });
  }

}

export {
  CharacretCreate_API
};