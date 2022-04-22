import type {
  CharacterData,
  MoveData,
  MoveToData,
  WorldData
} from '../game';

import {
  MainScreen
} from './main_screen';

import {
  WorldScreen,
  TargetInteract
} from './world_screen';

// export * from './move/wasd_move';
// export * from './move/cursor_move';
export * from './move/target_move';

class View {

  protected main_screen: MainScreen;
  protected world_screen: WorldScreen;

  initialize(): View {
    this.initialize_screens();
    return this;
  }

  protected initialize_screens(): void {
    this.main_screen = new MainScreen().initialize();
    this.world_screen = new WorldScreen().initialize();
  }

  createWorld(
    userData: CharacterData,
    worldData: WorldData
  ): void {
    this.main_screen.hide();
    this.world_screen.show();
    this.init_scene(worldData);
    
    this.world_screen.updateUser(userData);
    GAME.store.addCharacter(worldData.userIndex, userData);

    this.world_screen.updateCharactersList();
  }

  protected init_scene(
    data: WorldData
  ): void {
    const user_id = GAME.store.getUserIndex();
    for (const id in data.characters) {
      const character = data.characters[id];
      if (!character || +id === user_id) {
        continue;
      }
      this.world_screen.addCharacter(+id, character);
    }
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    this.world_screen.addCharacter(index, data);
    this.world_screen.updateCharactersList();
  }

  removeCharacter(
    index: number
  ) {
    this.world_screen.removeCharacter(index);
    this.world_screen.updateCharactersList();
  }

  newMessage(
    index: number,
    message: string
  ): void {
    this.world_screen.newMessage(index, message);
  }

  destroyWorld(): void {
    this.world_screen.destroy();
    this.main_screen.show();
  }

  characterMove(data: MoveData): void {
    this.world_screen.characterMove(data);
  }

  characterMoveTo(data: MoveToData): void {
    this.world_screen.characterMoveTo(data);
  }

  characterUseSkill(
    index: number,
    skillId: number
  ): void {
    this.world_screen.characterUseSkill(index, skillId);
  }

  characterApplySkill(
    index: number,
    skillId: number
  ): void {
    this.world_screen.characterApplySkill(index, skillId);
  }

  characterCancelUseSkill(
    index: number,
    code?: number
  ): void {
    if (UTILS.types.isNumber(code)) {
      console.warn('User skill canceled', code);
    }
    this.world_screen.characterCancelUseSkill(index);
  }

  interact(
    skillId: number,
    targets: TargetInteract[]
  ): void {
    this.world_screen.interact(skillId, targets);
  }

}

export {
  View
};