import './utils/index';

// import './utils/tests/index';
// import './mechanics/tests/index';

import fastify from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import { mechanic } from './mechanic';
import { store } from './store';
import { viewRoute } from './routes/viewRoute';
import { apiRoute } from './routes/apiRoute';
import { socketsRoute } from './routes/socketsRoute';

const server = fastify({
  // logger: true
});

const game = async function (server) {  
  server.register(fastifyPlugin(mechanic));
  server.register(fastifyPlugin(store));
  server.register(fastifyPlugin(viewRoute));
  server.register(fastifyPlugin(apiRoute));
  server.register(fastifyPlugin(socketsRoute));
};

server.register(fastifyPlugin(game));

server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});
