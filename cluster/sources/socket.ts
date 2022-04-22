import type { 
  Socket as ioSocket
} from 'socket.io';

import type {
  Character
} from './mechanics/index';

import type {
  Session,
  CharacterWorldData
} from './session';

interface Socket extends ioSocket {
  data: {
    logout: NodeJS.Timeout;
    character: Character;
    characterWorldData: CharacterWorldData;
    session: Session;
  }
}

export {
  Socket
};