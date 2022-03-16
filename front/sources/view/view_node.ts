import type {
  GameObject
} from './game_object';

class ViewNode {

  node: HTMLElement;

  initialize(
    path: string
  ): ViewNode {
    this.node = document.querySelector(path);
    return this;
  }

  show(): void {
    this.node.style.display = 'inline';
  }

  hide(): void {
    this.node.style.display = 'none';
  }

  getValue(): string {
    return (this.node as HTMLInputElement).value;
  }

  setValue(
    value: string
  ): void {
    (this.node as HTMLInputElement).value = value;
  }

  addChild(
    viewNode: ViewNode | GameObject
  ): void {
    this.node.appendChild(viewNode.node);
  }

  removeChild(
    viewNode: ViewNode | GameObject
  ): void {
    this.node.removeChild(viewNode.node);
  }

  removeChildren(): void {
    while (this.node.firstChild) {
      this.node.removeChild(this.node.lastChild);
    }
  }

  addClick(
    callback: () => void
  ): void {
    this.node.addEventListener('click', callback);
  }

}

export {
  ViewNode
};