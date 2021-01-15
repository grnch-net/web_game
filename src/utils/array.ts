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

const array = {
  toArray
}

export {
  array
}

declare global {
  interface Array<T> {
    last: T | undefined;
  }
}
