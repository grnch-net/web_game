import type {
  PointParameters,
  CharacterData
} from '../game';

import {
  SkillName
} from '../config';

const svgURI = 'http://www.w3.org/2000/svg';
const xlink = 'http://www.w3.org/1999/xlink';

interface Skill {
  id: number;
  node: SVGElement;
}

@UTILS.modifiable
class GameObject {

  node: SVGElement;
  data: CharacterData;
  direction: PointParameters;
  protected character_model_path: string;
  protected update_time: number;
  protected current_skill: Skill;
  protected is_move: boolean;

  initialize(
    data: CharacterData
  ): GameObject {
    this.data = data;
    this.initialize_vars();
    this.create_node();
    this.update();
    return this;
  }

  protected initialize_vars(): void {
    this.character_model_path = '#character-prefab';
    this.direction = { x: 0, y: 0, z: 0 };
  }

  protected create_node(): void {
    this.node = document.createElementNS(svgURI, 'g');
    
    const character_model = document.createElementNS(svgURI, 'use');
    character_model.setAttributeNS(xlink, 'href', this.character_model_path);
    this.node.appendChild(character_model);
  }

  update(): void {
    this.updateTransform();
  }

  updateMove(
    position: [number, number, number],
    rotation: number,
    direction: number,
    forcePercent: number
  ): void {
    if (position) {
      const [x, y, z] = position;
      this.data.position.x = x;
      this.data.position.y = y;
      this.data.position.z = z;
    }
    
    if (rotation) {
      this.data.rotation = rotation;
    }

    this.updateDirection(direction);
    this.updateTransform();
  }

  updateTransform(): void {
    const { longitude } = GAME.store.worldConfig;
    let transform = '';

    const { x, y, z } = this.data.position;
    transform += ` translate(${x}, ${longitude - z})`;

    const rotate = this.data.rotation * 360 / (Math.PI * 2);
    transform += ` rotate(${rotate})`;

    this.node.setAttribute('transform', transform);
  }

  moveTo(
    position: PointParameters,
    length?: number
  ): boolean {
    if (this.is_move) {
      return false;
    }

    const checked = this.checkMovePosition(position);
    if (!checked) {
      return false;
    }

    this.is_move = true;

    const { longitude } = GAME.store.worldConfig;
    if (!length) {
      const qX = (position.x - this.data.position.x) ** 2;
      const qZ = (position.z - (longitude - this.data.position.z)) ** 2;
      length = Math.sqrt(qX + qZ);
    }

    this.data.forcePercent = 1;
    const move_force = this.data.moveForce * this.data.forcePercent;
    const move_time = length / move_force;

    const start_point = {
      x: this.data.position.x,
      y: this.data.position.y,
      z: this.data.position.z
    };

    const finish_point = {
      x: position.x,
      y: position.y,
      z: longitude - position.z
    };
    const start_time = performance.now() / 100;
    const finish_time = start_time + move_time;

    setTimeout(() => this.move_to_progress(start_point, finish_point, start_time, finish_time));

    return true;
  }

  protected checkMovePosition(
    position: PointParameters
  ): boolean {
    const { latitude, longitude, height } = GAME.store.worldConfig;

    if (
      position.x > latitude
      || position.x < 0
      || position.y > height
      || position.y < 0
      || position.z > longitude
      || position.z < 0
    ) {
      return false;
    }

    return true;
  }

  protected move_to_progress(
    startPoint: PointParameters,
    finishPoint: PointParameters,
    startTime: number,
    finishTime: number
  ): void {
    const now_time = performance.now() / 100;
    let progress: number;

    if (now_time >= finishTime) {
      progress = 1;
    } else {
      progress = (now_time - startTime) / (finishTime - now_time);
    }


    this.data.position.x = startPoint.x + (finishPoint.x - startPoint.x) * progress,
    this.data.position.y = 0,
    this.data.position.z = startPoint.z + (finishPoint.z - startPoint.z) * progress

    this.updateTransform();

    if (progress < 1) {
      setTimeout(() => this.move_to_progress(startPoint, finishPoint, startTime, finishTime));
    } else {
      this.is_move = false;
    }
  }

  updateDirection(
    moveDirection?: number
  ) {
    if (!moveDirection && moveDirection !== 0) {
      moveDirection = this.data.direction;
    } else {
      this.data.direction = moveDirection;
    }

    let radian = moveDirection;
    radian = radian % (Math.PI * 2);
    if (radian < 0) {
      radian += Math.PI * 2;
    }

    this.direction.x = -Math.sin(-radian);
    this.direction.y = 0;
    this.direction.z = Math.cos(-radian);
  }

  moveStart(): void {
    console.log('moveStart');
  }

  protected check_move_progress(
    position: PointParameters,
    direction: PointParameters
  ): boolean {
    console.log('check_move_progress', { position, direction });
    return true;
  }

  moveStop(): void {
    console.log('moveStop');
  }

  useSkill(
    skillId: number
  ): void {
    if (this.current_skill) {
      this.cancelUseSkill();
    }

    let skill_node: SVGElement;

    if (skillId === SkillName.Attack) {
      skill_node = document.createElementNS(svgURI, 'use');
      skill_node.setAttributeNS(xlink, 'href', '#attack-skill-prefab');
    } else
    if (skillId === SkillName.Block) {
      skill_node = document.createElementNS(svgURI, 'use');
      skill_node.setAttributeNS(xlink, 'href', '#block-skill-prefab');
    } else {
      return;
    }

    skill_node.setAttribute('opacity', '0.2');
    this.node.appendChild(skill_node);

    this.current_skill = {
      id: skillId,
      node: skill_node
    };
  }

  applySkill(
    skillId: number
  ): void {
    if (!this.current_skill) {
      this.useSkill(skillId);
    } else
    if (this.current_skill.id !== skillId) {
      this.cancelUseSkill();
      this.useSkill(skillId);
    }

    this.current_skill.node.setAttribute('opacity', '1');

    if (this.current_skill.id === SkillName.Attack) {
      setTimeout(() => this.completeUseSkill(), 500);
    }
  }

  completeUseSkill(): void {
    this.node.removeChild(this.current_skill.node);
    this.current_skill = null;
  }

  cancelUseSkill(): void {
    if (!this.current_skill) {
      return;
    }
    this.node.removeChild(this.current_skill.node);
    this.current_skill = null;
  }

  applyAttack(): void {
    const interact_node = document.createElementNS(svgURI, 'use');
    interact_node.setAttributeNS(xlink, 'href', '#interact-attack-prefab');
    this.node.appendChild(interact_node);
    setTimeout(() => {
      this.node.removeChild(interact_node);
    }, 1000);
  }

}

export {
  GameObject
};