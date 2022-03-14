import type {
  PointParameters,
  CharacterData
} from '../game';

class GameObject {

  node: SVGElement;
  data: CharacterData;

  create(
    path: string,
    data: CharacterData
  ): GameObject {
    this.data = data;
    this.create_node(path);
    return this;
  }

  protected create_node(
    path: string
  ): void {
    this.node = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    this.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', path);
  }

  update(): void {
    this.updatePosition();
  }

  updatePosition(): void {
    const { longitude } = GAME.store.worldConfig;
    let transform = '';

    const { x , y, z } = this.data.position;
    transform += ` translate(${x}, ${longitude - z})`;

    const rotate = this.data.rotation * 360 / (Math.PI * 2);
    transform += ` rotate(${rotate})`;

    this.node.setAttribute('transform', transform);
  }

  updateDirection(
    moveDirection: number
  ) {
    if (!moveDirection && moveDirection !== 0) {
      moveDirection = this.data.direction;
    } else {
      this.data.direction = moveDirection;
    }

    let radian = this.data.rotation + moveDirection;
    radian = radian % (Math.PI * 2);
    if (radian < 0) {
      radian += Math.PI * 2;
    }

    this.data.directionPoint.x = -Math.sin(-radian);
    this.data.directionPoint.y = 0;
    this.data.directionPoint.z = Math.cos(-radian);
  }

}

export {
  GameObject
};