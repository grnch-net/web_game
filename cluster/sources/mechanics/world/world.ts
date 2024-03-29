import type {
  PointParameters
} from '../point';

import type {
  Inventory
} from '../inventory/index';

import {
  Timeline
} from '../timeline';

import {
  Character
} from '../characters/character';

import {
  InteractionController,
  ActionListener
} from '../interactions/index';

import {
  BoxParameters,
  Box
} from '../box';

type CharacterList = List<Character>;

@UTILS.modifiable
class World {

  characters: CharacterList;
  boxes: Box[];
  protected _size: number;
  protected _timeline: Timeline<Character>;
  protected interaction_controller: InteractionController;
  protected last_time: number;

  initialize(): World {
    this.initialize_variables();
    this.initialize_interaction();
    return this;
  }

  protected initialize_variables() {
    this.characters = new UTILS.array.List;
    this.boxes = [];
    this._size = 500;
    this._timeline = new Timeline;
  }

  protected initialize_interaction() {
    this.interaction_controller = new InteractionController;
    this.interaction_controller.initialize(this.characters, this._timeline, this._size);
  }

  destroy(): void {
    // TODO: Destroy world
  }

  addActionListener(
    listener: ActionListener
  ): void {
    this.interaction_controller.addActionListener(listener);
  }

  addCharacter(
    character: Character
  ): number {
    const id = this.characters.add(character);
    character.world = this.interaction_controller;
    character.id = id;
    return id;
  }

  removeCharacter(
    id: number
  ): boolean {
    const character = this.characters.remove(id);
    if (!character) {
      return false;
    }
    character.destroy();
    return true;
  }

  getCharacter(
    id: number
  ): Character {
    return this.characters.elements[id];
  }

  startTicker(): void {
    this.last_time = Date.now();
  }

  tick(
    dt: number
  ) {
    const point = this._timeline.tick(dt);
    this.tick_wait(point.dt);
    this.interaction_controller.tick(dt);
    this.tick_characters(point.data);
    if (point.left) {
      this.tick(point.left);
    }
  }

  update() {
    this.tick_characters(this.characters.elements);
  }

  protected tick_wait(
    dt: number
  ) {
    for (const character of this.characters.elements) {
      if (!character) {
        continue;
      }
      character.wait += dt;
    }
  }

  protected tick_characters(
    characters: Character[]
  ) {
    if (!characters) {
      return;
    }
    for (const character of characters) {
      if (!character) {
        continue;
      }
      character.tick(0);
    }
  }

  getItemsContainer(
    author: Character
  ): Inventory {
    let box: Box;
    for (const _box of this.boxes) {
      const distance = _box.position.lengthTo(author.position);
      if (distance > 2) continue;
      box = _box;
      break;
    };
    if (box) return box.inventory;
    box = this.create_box(author.position);
    return box.inventory;
  }

  protected create_box(
    position: PointParameters
  ): Box {
    const parameters: BoxParameters = {
      position: { ...position },
      inventory: []
    };
    const box = new Box;
    box.initialize(parameters);
    this.boxes.push(box);
    return box;
  }
}

export {
  World
};