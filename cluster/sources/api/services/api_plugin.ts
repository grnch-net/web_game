import type { FastifyReply, FastifyRequest, FastifySchema, HTTPMethods } from 'fastify';
import type { ObjectProperties } from 'fast-json-stringify';

import { GamePlugin } from '../../services/game_plugin';

class APISchema {

  protected schema: FastifySchema;

  initialize(): void {
    this.schema = {
      body: {
        type: 'object',
        properties: this.getRequestBody()
      },
      response: {
        200: {
          type: 'object',
          properties: this.getResponseBody()
        },
        210: {
          type: 'object',
          properties: this.getErrorBody()
        }
      }
    };
  }

  protected getErrorBody(): ObjectProperties {
    return {
      error: {
        type: 'boolean'
      },
      msg: {
        type: 'string'
      }
    };
  }

  protected getRequestBody(): ObjectProperties {
    return {};
  }

  protected getResponseBody(): ObjectProperties {
    return {
      success: {
        type: 'boolean'
      }
    };
  }

  getSchema(): FastifySchema {
    return this.schema;
  }

}

abstract class APIPlugin extends GamePlugin {

  protected schema: APISchema;

  override initializePlugin(): void {
    this.initialize_schema();
    this.initialize_route();
  }

  protected initialize_schema(): void {
    const APISchema = this.getAPISchema();
    this.schema = new APISchema;
    this.schema.initialize();
  }

  protected getAPISchema(): typeof APISchema {
    return APISchema;
  }

  protected initialize_route(): void {
    this.server.route({
      method: this.getMethod(),
      url: this.getURL(),
      schema: this.getSchema(),
      handler: (request, reply) => this.handler(request, reply)
    });
  }

  protected sendError(reply: FastifyReply, msg: string) {
    let response_body = {
      error: true,
      msg
    };
    reply.status(210).send(response_body);
  }

  protected getMethod(): HTTPMethods {
    return 'POST';
  }

  protected getURL(): string {
    // Override
    return '/404';
  }

  protected getSchema(): FastifySchema {
    return this.schema.getSchema();
  }

  protected handler(
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    // Override
    reply.send({
      success: true
    });
  }

}

export {
  APISchema,
  APIPlugin
};