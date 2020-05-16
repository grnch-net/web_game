import { DisplayObject } from './display_object';

class World {
  application: PIXI.Application;
  model: PIXI.Container;

  get renderer(): PIXI.Renderer {
    return this.application.renderer;
  }

  initialize() {
    this.application = new PIXI.Application({
      resizeTo: document.body
    });
    document.body.appendChild(this.application.view);

    const width = this.application.screen.width;
    const height = this.application.screen.height;
    const half_width = width * 0.5;
    const half_height = height * 0.5;

    this.model = new PIXI.Container;
    this.model.position.set(half_width, half_height);
    this.application.stage.addChild(this.model);

    const graphics = new PIXI.Graphics;
    graphics
    .beginFill(0xffffff)
    .drawRect(0, 0, 49, 49)
    .beginFill(0x000000)
    .drawRect(49, 0, 1, 49)
    .drawRect(0, 49, 50, 1)
    .cacheAsBitmap = true;

    const texture = this.renderer.generateTexture(
      graphics, PIXI.SCALE_MODES.LINEAR, 1
    );
    const bg = new PIXI.TilingSprite(texture, width, height);
    bg.position.set(-half_width, -half_height);
    this.model.addChild(bg);
  }

  addChild(
    child: DisplayObject
  ) {
    this.model.addChild(child.model);
  }
}

export {
  World
}
