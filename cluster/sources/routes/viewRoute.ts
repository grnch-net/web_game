import type { FastifyInstance } from 'fastify';
import { join } from 'path';
import { promises as fs } from 'fs';
import FastifyStatic from 'fastify-static';

async function viewRoute(
  server: FastifyInstance
): Promise<void> {
  server.route({
    method: 'GET',
    url: '/',
    handler: async(request, reply) => {
      const data = await fs.readFile(join(process.cwd(), 'client', 'index.html'));
      reply.header('content-type', 'text/html; charset=utf-8');
      reply.send(data);
    }
  });
  
  server.register(FastifyStatic, {
    root: join(process.cwd(), 'client/src'),
    prefix: '/src/',
  });
}

export {
  viewRoute
}