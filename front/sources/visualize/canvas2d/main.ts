import 'pixi.js';

import { World } from './world';
import { Player } from './player';

const world = new World;
world.initialize();

const player = new Player;
player.initialize();
world.addChild(player);
PIXI.Ticker.shared.add(dt => player.tick(dt))
