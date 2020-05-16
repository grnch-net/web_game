import { DisplayObject } from './display_object';

class Bullet extends DisplayObject {
  model: PIXI.Graphics;
  protected direction: { x: number, z : number };
  protected distance: number = 200;
  protected move_speed: number = 15;

  initialize(
    direction: { x: number, z : number },
  ) {
    this.direction = direction;
    this.model = new PIXI.Graphics;
    this.model
    .beginFill(0xff0000)
    .drawCircle(0, 0, 30)
    .cacheAsBitmap = true;
    this.model.scale.set(0.5);
  }

  move(
    step: number
  ) {
    this.model.position.set(
      this.model.x - this.direction.x * step,
      this.model.y - this.direction.z * step
    );
  }

  tick(
    dt: number
  ) {
    if (this.distance <= 0) {
      this.model.destroy();
      return false;
    }
    const step = this.move_speed * dt;
    this.distance -= step;
    this.move(step);
    return true;
  }
}

type Action = (dt: number) => boolean;

class Player extends DisplayObject {
  model: PIXI.Graphics;
  protected move_speed: number = 5;
  protected shot_delay: number = 0.1;
  protected actions: Action[];

  initialize() {
    this.actions = [];

    this.model = new PIXI.Graphics;
    this.model
    .beginFill(0xffffff)
    .lineStyle(15, 0x0000ff)
    .drawCircle(0, 0, 60)
    .lineTo(0, 0)
    .lineTo(0, -60)
    .cacheAsBitmap = true;
    this.model.scale.set(0.5);

    this.initialize_move();
    this.initialize_shot();
  }

  protected initialize_move() {
    const dir = { x: 0, z: 0 };
    let vx = 0;
    let vz = 0;
    let isMove = false;
    const normalize = () => {
      if (dir.x == 0 && dir.z == 0) {
        moveend();
        return;
      }
      const length = Math.sqrt(Math.abs(dir.x) + Math.abs(dir.z));
      vx = dir.x / length;
      vz = dir.z / length;
      let angle = Math.acos(vz / Math.sqrt(vx ** 2 + vz ** 2));
      if (dir.x > 0) angle *= -1;
      this.model.rotation = angle;
    };
    const action = (dt: number) => {
      if (!isMove) return false;
      const step = this.move_speed * dt;
      this.model.position.set(
        this.model.x - vx * step,
        this.model.y - vz * step
      );
      return true;
    };
    const movestart = () => {
      if (isMove) return;
      isMove = true;
      this.actions.push(action);
    };
    const moveend = () => {
      isMove = false;
    };
    document.addEventListener('keydown', event => {
      if (event.key == 'w') {
        dir.z = 1;
      } else
      if (event.key == 's') {
        dir.z = -1;
      } else
      if (event.key == 'a') {
        dir.x = 1;
      } else
      if (event.key == 'd') {
        dir.x = -1;
      } else return;
      normalize();
      movestart();
    });
    document.addEventListener('keyup', event => {
      if (event.key == 'w') {
        if (dir.z != 1) return;
        dir.z = 0;
      } else
      if (event.key == 's') {
        if (dir.z != -1) return;
        dir.z = 0;
      } else
      if (event.key == 'a') {
        if (dir.x != 1) return;
        dir.x = 0;
      } else
      if (event.key == 'd') {
        if (dir.x != -1) return;
        dir.x = 0;
      } else return;
      normalize();
    });
  }

  protected initialize_shot() {
    const dir = { x: 0, z: 0 };
    let vx = 0;
    let vz = 0;

    const normalize = () => {
      if (dir.x == 0 && dir.z == 0) {
        shotend();
        return;
      }
      const length = Math.sqrt(Math.abs(dir.x) + Math.abs(dir.z));
      vx = dir.x / length;
      vz = dir.z / length;
    };

    let delay = 0;
    const action = () => {
      if (!isShot) return false;
      if (delay <= 0) {
        const bullet = new Bullet;
        bullet.initialize({ x: vx, z: vz });
        bullet.model.position.copyFrom(this.model.position);
        bullet.move(30);
        this.model.parent.addChild(bullet.model);
        this.actions.push(dt => bullet.tick(dt));
        delay = this.shot_delay - delay;
      } else {
        delay -= PIXI.Ticker.shared.elapsedMS * 0.001;
      }
      return true;
    };

    let isShot = false;
    const shotstart = () => {
      if (isShot) return;
      isShot = true;
      delay = 0;
      this.actions.push(action);
    };

    const shotend = () => {
      isShot = false;
    };

    document.addEventListener('keydown', event => {
      if (event.key == 'ArrowUp') {
        dir.z = 1;
      } else
      if (event.key == 'ArrowDown') {
        dir.z = -1;
      } else
      if (event.key == 'ArrowLeft') {
        dir.x = 1;
      } else
      if (event.key == 'ArrowRight') {
        dir.x = -1;
      } else return;
      normalize();
      shotstart();
    });
    document.addEventListener('keyup', event => {
      if (event.key == 'ArrowUp') {
        if (dir.z != 1) return;
        dir.z = 0;
      } else
      if (event.key == 'ArrowDown') {
        if (dir.z != -1) return;
        dir.z = 0;
      } else
      if (event.key == 'ArrowLeft') {
        if (dir.x != 1) return;
        dir.x = 0;
      } else
      if (event.key == 'ArrowRight') {
        if (dir.x != -1) return;
        dir.x = 0;
      } else return;
      normalize();
    });
  }

  tick(dt: number) {
    const actions = [];
    for (const action of this.actions) {
      action(dt) && actions.push(action);
    }
    this.actions = actions;
  }
}

export {
  Player
}
