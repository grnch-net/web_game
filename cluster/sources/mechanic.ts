import type { FastifyInstance } from 'fastify';
import * as mechanics from './mechanics/index';

async function mechanic (server: FastifyInstance) {
  const mechanic = new mechanics.Mechanic;
  mechanic.initialize();
  server.decorate('mechanic', mechanic);
}

declare module 'fastify' {
  interface FastifyInstance {
    mechanic: mechanics.Mechanic
  }
}

export {
  mechanic
}