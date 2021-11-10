if (!Array.prototype.hasOwnProperty("last")) {
  Object.defineProperty(Array.prototype, "last", {
    get() {
      return this[this.length - 1];
    }
  });
}

function toArray(
  value: any
): any[] {
  return Array.isArray(value) ? value : [value];
}

class List<T> {

  elements: T[];
  protected _count: number;
  protected last_index: number;
  protected empty_indexes: number[];

  constructor() {
    this._count = 0;
    this.elements = [];
    this.last_index = 0;
    this.empty_indexes = [];
  }

  get count(): number {
    return this._count; 
  }

  add(element: T, check = true): number {
    if (check && this.elements.includes(element)) {
      return -1;
    }
    let index: number;
    if (this.empty_indexes.length) {
      index = this.empty_indexes.pop();
    } else {
      index = this.last_index;
      ++this.last_index;
    }
    this.elements[index] = element;
    ++this._count;
    return index;
  }

  remove(index: number): T {
    const element = this.elements[index];
    if (!element) {
      return null;
    }
    this.elements[index] = null;
    this.empty_indexes.push(index);
    --this._count;
    return element;
  }

}

export {
  toArray,
  List
}

declare global {
  interface Array<T> {
    last: T | undefined;
  }
}
