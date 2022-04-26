import {
  Store
} from './store';

import {
  Network
} from './network';

import {
  View
} from './view/view';

interface PointParameters {
  x: number;
  y: number;
  z: number;
}

interface CharacterData {
  name: string;
  position: PointParameters;
  rotation: number;
  direction: number;
  moveForce: number;
  forcePercent: number;
}

interface MoveData {
  id: number;
  position: [number, number, number];
  rotation: number;
  direction: number;
  forcePercent: number;
}

interface MoveToData {
  id: number;
  position: [number, number, number];
  rotation: number;
}

interface UseSkillData {
  id: number;
  skillId: number;
}

interface CancelUseSkillData {
  id?: number;
  code?: number;
}

interface WorldActionData {
  authorId: number;
  skill: number;
  targets: any;
}

interface WorldData {
  userIndex: number;
  characters: CharacterData[];
}

class Game {

  store: Store;
  protected network: Network;
  protected view: View;

  initialize(): Game {
    this.store = new Store().initialize();
    this.network = new Network().initialize();
    this.view = new View().initialize();
    return this;
  }

  async createCharacter(
    characterName: string
  ): Promise<CharacterData> {
    return await this.network.createCharacter(characterName);
  }

  async getCharacterData(
    characterName: string
  ): Promise<CharacterData> {
    return await this.network.getCharacterData(characterName);
  }

  findSession(
    characterName: string,
  ): void {
    this.network.findSession(characterName);
  }

  cancelFindSession(): void {
    this.network.cancelFindSession();
  }

  enterToWorld(
    characterId: number,
    worldData: WorldData
  ): void {
    this.store.updateUserId(characterId);
    this.store.updateWorld(worldData);
    this.view.startSession(worldData);
  }

  leaveSession(): void {
    this.store.leaveSession();
    this.view.leaveSession();
  }

  addCharacter(
    index: number,
    data: CharacterData
  ): void {
    this.store.addCharacter(index, data);
    this.view.addCharacter(index, data);
  }

  removeCharacter(
    index: number
  ): void {
    this.store.removeCharacter(index);
    this.view.removeCharacter(index);
  }

  // logout(): void {
  //   this.network.logout();
  // }

  say(
    message: string
  ): void {
    this.network.say(message);
  }

  newMessage(
    index: number,
    message: string
  ): void {
    this.view.newMessage(index, message);
  }

  userMove(): void {
    this.network.userMove();
  }

  userMoveTo(
    position: PointParameters
  ): void {
    this.network.userMoveTo(position);
  }

  characterMove(
    data: MoveData
  ): void {
    this.view.characterMove(data);
  }

  characterMoveTo(
    data: MoveToData
  ): void {
    this.view.characterMoveTo(data);
  }

  userUseSkill(
    skillId: number
  ): void {
    this.network.userUseSkill(skillId);
  }

  userCancelUseSkill(): void {
    this.network.userCancelUseSkill();
  }

  characterUseSkill(
    data: UseSkillData
  ): void {
    const {
      id,
      skillId
    } = data;
    this.view.characterUseSkill(id, skillId);
  }

  characterCancelUseSkill(
    data: CancelUseSkillData
  ): void {
    const {
      id,
      code
    } = data;
    const character_id = UTILS.types.isNumber(id) ? id : this.store.getUserId();
    this.view.characterCancelUseSkill(character_id, code);
  }

  worldAction(
    data: WorldActionData
  ): void {
    const {
      authorId,
      skill,
      targets
    } = data;
    const id = UTILS.types.isNumber(authorId) ? authorId : this.store.getUserId();
    this.view.characterApplySkill(id, skill);
    this.view.interact(skill, targets);
  }

}

export {
  Game,
  PointParameters,
  CharacterData,
  MoveData,
  MoveToData,
  WorldData
};