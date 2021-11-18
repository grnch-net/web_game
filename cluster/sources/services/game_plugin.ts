import type { FastifyInstance } from 'fastify';

class GamePlugin {

  protected server: FastifyInstance;

  initializeServer(
    server: FastifyInstance,
  ): void {
    this.server = server;
  }

  initializePlugin(): void {
    // Override
  }

}

export {
  GamePlugin
};