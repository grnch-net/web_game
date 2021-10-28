interface CustomObjectConfig {
  specialClass?: string;
}

class CustomizeObject {

  static customs: Associative<typeof CustomizeObject> = {};
  static configs: Associative<CustomObjectConfig>;

  static AddCustomClass(
    id: string,
    custom: typeof CustomizeObject
  ) {
    this.customs[id] = custom;
  }

  static findConfig(
    id: string
  ): CustomObjectConfig {
    return this.configs[id];
  }

  static findSpecialClass(
    specialId: string
  ): typeof CustomizeObject {
    return this.customs[specialId];
  }

  static create(
    parameters: any,
    config?: string | number | any
  ): CustomizeObject {
    if (!UTILS.types.isObject(config)) {
      let id = config;
      if (!id && id !== 0) {
        id = parameters.id;
      }
  
      config = this.findConfig(id as string);
      if (!config) {
        console.error('Can not find config', parameters, config);
        return null;
      }
    }

    let ObjectClass = this;
    if (config.specialClass) {
      ObjectClass = this.findSpecialClass(config.specialClass);;
      if (!ObjectClass) {
        console.error('Can not find special class.', config, parameters);
        return null;
      }
    }
    const _object = new ObjectClass();
    (_object as any).initialize(config, parameters);
    return _object;
  }

  // protected config: CustomObjectConfig;
  // protected parameters: any;
  // initialize(
  //   config: CustomObjectConfig,
  //   parameters: any
  // ) {
  //   this.config = config;
  //   this.parameters = parameters;
  // }

}

const reg = /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/;

function customize(
  configs: Associative<CustomObjectConfig>
) {
  return function<T extends AnyClass>(constructor: T) {
    Object.getOwnPropertyNames(CustomizeObject)
    .forEach(key => {
      if (key.match(reg)) {
        return;
      }
      const properties = Object.getOwnPropertyDescriptor(CustomizeObject, key);
      Object.defineProperty(constructor, key, properties);
    });
    (constructor as any).configs = configs;
    return constructor;
  }
}

export {
  customize
}
