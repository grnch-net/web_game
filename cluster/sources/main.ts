import '../../utils/index';

import type { GamePlugin } from './services/game_plugin';

import fastify, { FastifyInstance } from 'fastify';
import fastifyCORS from 'fastify-cors';

import { Mechanic } from './mechanics/index';
import { Store } from './store';

import { CharacretCreate_API } from './api/api_character_create';
import { CharacretGet_API } from './api/api_character_get';
import { View } from './view';
import { Sockets } from './sockets';

declare module 'fastify' {
  interface FastifyInstance {
    mechanic: Mechanic
    store: Store
  }
}

class Game {

  server: FastifyInstance;

  initialize(): void {
    this.initialize_server();
    console.group('server register');
    this.initialize_decorators();
    this.initialize_plugins();
    console.groupEnd();
  }

  protected initialize_server(): void {
    this.server = fastify({
      // logger: true
    });
  }

  protected initialize_decorators(): void {
    this.register_decorator('mechanic', Mechanic);
    this.register_decorator('store', Store);
  }

  protected initialize_plugins(): void {    
    this.initialize_cors();
    this.initialize_view();
    this.initialize_api();
    this.initialize_sockets();
  }

  protected initialize_cors(): void {
    this.server.register(fastifyCORS, { 
      origin: "*",
      methods: ["POST"]
    });
  }

  protected initialize_view(): void {
    this.register_plugin('View', View);
  }

  protected initialize_api(): void {
    this.register_plugin('APICharacterCreate', CharacretCreate_API);
    this.register_plugin('APICharacretGet', CharacretGet_API);
  }

  protected initialize_sockets(): void {
    this.register_plugin('Sockets', Sockets);
  }

  protected register_decorator(name: string, Decorator: AnyClass): void {
    console.log(`- decorator ${name}`);
    const decorator = new Decorator();
    decorator.initialize();
    this.server.decorate(name, decorator);
  }

  protected register_plugin(name: string, Plugin: typeof GamePlugin): void {
    console.log(`- plugin ${name}`);
    this.server.register(async() => {
      const plugin = new Plugin;
      plugin.initializeServer(this.server);
      plugin.initializePlugin();
    });
  }

  runServer(): void {
    this.server.listen({
      port: 3009,
      // host: '192.168.1.122'
    }, (err, address) => {
      if (err) {
        this.server.log.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    });
  }

}

const game = new Game;
game.initialize();
game.runServer();