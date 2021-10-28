import { DisplayObject } from './display_object';

export class Container extends DisplayObject {
  children: DisplayObject[];

  initialize(...args: any) {
    this.children = [];
    this.initialize_model();
  }

  protected initialize_model() {
    this.model = new THREE.Group;
  }

  tick(
    dt: number
  ) {
    for (const child of this.children) {
      child.tick(dt);
    }
  }

  addChild(
    child: DisplayObject
  ) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    this.model.add(child.model);
    this.children.push(child);
    child.parent = this;
  }

  removeChild(
    child: DisplayObject
  ) {
    const index = this.children.indexOf(child);
    if (index == -1) return;
    this.model.remove(child.model);
    this.children.splice(index, 1);
    delete child.parent;
  }

}
