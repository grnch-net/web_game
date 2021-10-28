type ModCall = (Latest) => AnyClass;

type ComingMod = {
  call: ModCall,
  key?: string
};

type ComingMods = {
  [key: string]: ComingMod[]
};

function modify(
  Mod: any,
  key?: string
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

  if (key) {
    this.uses_mods.push(key);
    const comings: ComingMod[] = this.coming_mods[key];
    if (comings) {
      for (const coming_mod of comings) {
        const sub_mod = coming_mod.call(Mod);
        this.modify(sub_mod, coming_mod.key);
      }
    }
  }
}

function modifyAfter(
  coming: string,
  modCall: ModCall,
  key?: string
) {
  if (this.uses_mods.includes(coming)) {
    const sub_mod = modCall(this._Latest);
    this.modify(sub_mod, key);
    return;
  }
  this.coming_mods[coming] = this.coming_mods[coming] || [];
  this.coming_mods[coming].push({ call: modCall, key });
}

function modifiable<T extends AnyClass>(constructor: T) {
  const properties = Object.getOwnPropertyDescriptors(constructor.prototype);
  const proto = Object.getPrototypeOf(constructor.prototype);
  class Mod extends constructor {
    static _Latest = constructor;
    static coming_mods: ComingMods = {};
    static uses_mods: string[] = [];
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
    static get modifyAfter() {
      if (!this.hasOwnProperty('modifyAfter')) {
        return;
      }
      return modifyAfter;
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
    modifyAfter: typeof modifyAfter;
  };
}
