import World from './world';
import Character from './character';

const world = new World();
const hero = new Character()
world.location.addCharacter(hero);
