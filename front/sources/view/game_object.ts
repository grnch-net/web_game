import type {
  PointParameters,
  CharacterData
} from '../game';

import {
  SkillName
} from '../config';

class GameObject {

  node: SVGElement;
  data: CharacterData;
  direction: PointParameters;
  protected character_model_path: string;
  protected update_time: number;

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
    this.node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const character_model = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    character_model.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.character_model_path);
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
    
    if (forcePercent || forcePercent === 0) {
      this.data.forcePercent = forcePercent;
      if (forcePercent > 0) {
        this.moveStart();
      }
    }
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
    if (this.data.forcePercent !== 0) {
      requestAnimationFrame(() => this.moveProgress());
    }
    this.update_time = performance.now();
  }

  checkMoveProgress(
    position: PointParameters,
    direction: PointParameters
  ) {
    const { latitude, longitude, height } = GAME.store.worldConfig;
    let needStop = false;
    
    if (direction.x > 0) {
      if (position.x > latitude) {
        position.x = latitude;
        needStop = true;
      }
    } else
    if (direction.x < 0) {
      if (position.x < 0) {
        position.x = 0;
        needStop = true;
      }
    }
    
    if (direction.y > 0) {
      if (position.y > height) {
        position.y = height;
        needStop = true;
      }
    } else
    if (direction.y < 0) {
      if (position.y < 0) {
        position.y = 0;
        needStop = true;
      }
    }
    
    if (direction.z > 0) {
      if (position.z > longitude) {
        position.z = longitude;
        needStop = true;
      }
    } else
    if (direction.z < 0) {
      if (position.z < 0) {
        position.z = 0;
        needStop = true;
      }
    }

    return needStop;
  }

  moveProgress() {
    if (this.data.forcePercent === 0) {
      return;
    }

    const lastTime = this.update_time;
    const nowTime = this.update_time = performance.now();
    
    const dt = (nowTime - lastTime) / 100;
    const moveForce = this.data.moveForce * this.data.forcePercent;
    const position = {
      x: this.data.position.x,
      y: this.data.position.y,
      z: this.data.position.z
    };

    position.x += this.direction.x * moveForce * dt;
    position.y += this.direction.y * moveForce * dt;
    position.z += this.direction.z * moveForce * dt;

    let needStop = this.checkMoveProgress(position, this.direction);

    this.data.position.x = position.x;
    this.data.position.y = position.y;
    this.data.position.z = position.z;
    this.updateTransform();

    if (needStop) {
      this.moveStop();
    }

    requestAnimationFrame(() => this.moveProgress());
  }

  moveStop(): void {
    this.data.forcePercent = 0;
  }

  useSkill(
    skillId: number
  ): void {
    if (skillId === SkillName.Attack) {
      const attack_skill = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      attack_skill.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#attack-skill-prefab');
      this.node.appendChild(attack_skill);
    } else
    if (skillId === SkillName.Block) {
      const block_skill = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      block_skill.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#block-skill-prefab');
      this.node.appendChild(block_skill);
    }
  }

  cancelUseSkill(): void {
    // TODO:
  }

}

export {
  GameObject
};