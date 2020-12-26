function modify(
  Modified: any
) {
  this.Latest = Modified;
  const properties = Object.getOwnPropertyDescriptors(Modified.prototype);
  const proto = Object.getPrototypeOf(Modified.prototype);
  Object.defineProperties(this.prototype, properties);
  Object.setPrototypeOf(this.prototype, proto);
  // const static_properties = Object.getOwnPropertyDescriptors(Modified);
  // const static_proto = Object.getPrototypeOf(Modified);
  // delete static_properties.prototype;
  // Object.defineProperties(this, static_properties);
  // Object.setPrototypeOf(this, static_proto);
}

function modifiable(constructor: any): any {
  const properties = Object.getOwnPropertyDescriptors(constructor.prototype);
  const proto = Object.getPrototypeOf(constructor.prototype);
  const Class = class extends constructor {
    static Latest = constructor;
    static Base = constructor;
    static modify = modify;
    baseSuper = proto;
  }
  Object.defineProperties(Class.prototype, properties);
  Object.setPrototypeOf(Class.prototype, proto);
  return Class;
}

export {
  modifiable
}

declare global {
  type Modifiable<T> = T & {
    Latest: T;
    modify: typeof modify;
  }
}
