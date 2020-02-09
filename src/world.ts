import { Character } from './character';

class Location {
  characters: Character[];

  constructor() {
    this.characters = [];
  }

  addCharacter(character: Character) {
    this.characters.push(character);
  }
}

export default class World {
  location: Location;

  constructor() {
    this.location = new Location();
  }
}
