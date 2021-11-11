import type { FastifyInstance } from 'fastify';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CharacterWorldData {
  name: string;
  position: Position;
  rotation: number;
  attributes: Associative<number>;
  effects: number[];
  equips: number[];
}

interface WorldData {
  characters: CharacterWorldData[]
}

class Store {

  world: WorldData
  socketsId: string[]
  charactersInWorld: string[]
  charactersSecret: { [secret: string]: number }

  initialize() {
    this.world = {
      characters: []
    };
    this.socketsId = [];
    this.charactersInWorld = [];
    this.charactersSecret = {};
  }

}

async function store(
  server: FastifyInstance
): Promise<void> {
  const store = new Store();
  store.initialize();
  server.decorate('store', store);
}

declare module 'fastify' {
  interface FastifyInstance {
    store: Store
  }
}

export {
  store,
  WorldData,
  CharacterWorldData
};