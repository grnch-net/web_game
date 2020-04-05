const Class = class {};
type AnyClass = typeof Class;

function Modify<T extends AnyClass>(
  mod: (Latest: AnyClass) => T
) {
  const Modified = this.Latest = mod(this.Latest);
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
  const proto = Object.getPrototypeOf(constructor.prototype);
  return class extends constructor {
    protected static Latest = constructor;
    static Base = constructor;
    static Modify = Modify;
    baseSuper = proto;
  }
}

export {
  modifiable
}
