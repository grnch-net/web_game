if (!Array.prototype.hasOwnProperty("last")) {
  Object.defineProperty(Array.prototype, "last", {
    get() {
      return this[this.length - 1];
    }
  });
}

export {}

declare global {
  interface Array<T> {
    last: T | undefined;
  }
}
