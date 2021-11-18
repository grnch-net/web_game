import type { FastifyReply, FastifyRequest } from 'fastify';

import { GamePlugin } from './services/game_plugin';
import { join } from 'path';
import { promises as fs } from 'fs';
import FastifyStatic from 'fastify-static';

class View extends GamePlugin {

  override initializePlugin(): void {
    this.initialize_route();
    this.initialize_static();
  }

  protected initialize_route(): void {
    this.server.route({
      method: 'GET',
      url: this.getURL(),
      handler: (request, reply) => this.handler(request, reply)
    });
  }

  protected getURL(): string {
    return '/';
  }

  protected async handler(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const data = await fs.readFile(join(process.cwd(), 'client', 'index.html'));
    reply.header('content-type', 'text/html; charset=utf-8');
    reply.send(data);
  }

  protected initialize_static(): void {
    this.server.register(FastifyStatic, {
      root: join(process.cwd(), 'client/src'),
      prefix: '/src/',
    });
  }

}

export {
  View
};