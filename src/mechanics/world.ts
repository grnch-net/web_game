import type {
  PointParameters
} from './point';

import type {
  Inventory
} from './inventory/index';

import {
  Timeline
} from './timeline';

import {
  Character
} from './characters/character';

import {
  InteractionController
} from './interactions/index';

import {
  BoxParameters,
  Box
} from './box';

@UTILS.modifiable
export class World {
  characters: Character[];
  boxes: Box[];
  protected _size: number;
  protected _timeline: Timeline<Character>;
  protected interaction_controller: InteractionController;

  initialize() {
    this.initialize_variables();
    this.initialize_interaction();
  }

  protected initialize_variables() {
    this.characters = [];
    this.boxes = [];
    this._size = 500;
    this._timeline = new Timeline;
  }

  protected initialize_interaction() {
    this.interaction_controller = new InteractionController;
    this.interaction_controller.initialize(this.characters, this._timeline, this._size);
  }

  addCharacter(
    character: Character
  ) {
    this.characters.push(character);
    character.world = this.interaction_controller;
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
    this.tick_characters(this.characters);
  }

  protected tick_wait(
    dt: number
  ) {
    for (const character of this.characters) {
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
