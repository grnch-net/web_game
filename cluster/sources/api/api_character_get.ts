import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ObjectProperties } from 'fast-json-stringify';
import type * as mechanics from '../mechanics/index';

import { APIPlugin, APISchema } from './services/api_plugin';
import { characterParameters_SchemaObject } from './services/api_schemas';
import { APIUrl } from './services/api_urls';

class GetCharacret_APISchema extends APISchema {

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

interface CharacterGet_RequestBody {
  name: string;
}

interface CharacterGet_ResponseBody {
  parameters: mechanics.CharacterParameters;
}

class CharacretGet_API extends APIPlugin {

  protected getAPISchema(): typeof APISchema {
    return GetCharacret_APISchema;
  }

  protected getURL(): string {
    return APIUrl.CharacterGet;
  }

  protected handler(
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    const { store } = this.server;
    
    const body = request.body as CharacterGet_RequestBody;
    const character_parameters = store.getCharacter(body.name);

    if (!character_parameters) {
      this.sendError(reply, 'character_not_found');
      return;
    }

    let response_body: CharacterGet_ResponseBody = {
      parameters: character_parameters
    };
    reply.send({ data: response_body });
  }

}

export {
  CharacretGet_API
};