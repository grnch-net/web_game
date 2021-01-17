function modify(
  Mod: any
) {
  console.info(`- modify ${this.Base.name}: ${Mod.name}`);
  Object.defineProperty(Mod, 'isMod', {
    value: true
  });
  this._Latest = Mod;
  const properties = Object.getOwnPropertyDescriptors(Mod.prototype);
  const proto = Object.getPrototypeOf(Mod.prototype);
  Object.defineProperties(this.prototype, properties);
  Object.setPrototypeOf(this.prototype, proto);
  // const static_properties = Object.getOwnPropertyDescriptors(Mod);
  // const static_proto = Object.getPrototypeOf(Mod);
  // delete static_properties.prototype;
  // Object.defineProperties(this, static_properties);
  // Object.setPrototypeOf(this, static_proto);
}

function modifiable<T extends AnyClass>(constructor: T) {
  const properties = Object.getOwnPropertyDescriptors(constructor.prototype);
  const proto = Object.getPrototypeOf(constructor.prototype);
  class Mod extends constructor {
    static _Latest = constructor;
    static get Latest() {
      if (!this.hasOwnProperty('Latest')) {
        return;
      }
      return this._Latest;
    }
    static get Base() {
      if (!this.hasOwnProperty('Base')) {
        return;
      }
      return constructor;
    }
    static get modify() {
      if (!this.hasOwnProperty('modify')) {
        return;
      }
      return modify;
    }
    // baseSuper = proto;
  }
  Object.defineProperties(Mod.prototype, properties);
  Object.setPrototypeOf(Mod.prototype, proto);
  return Mod;
}

export {
  modifiable
}

declare global {
  type Modifiable<T> = T & {
    Latest: T;
    modify: typeof modify;
  };
}
