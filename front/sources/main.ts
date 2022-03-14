import '../../utils/index';

import {
  Game
} from './game';

declare global {
  interface Window {
    GAME: Game;
  }
  const GAME: Game;
}

const game = window.GAME = new Game().initialize();