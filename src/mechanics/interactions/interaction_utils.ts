import {
  InteractionObject,
  InteractionConfig,
  InteractionParameters
} from '../interactions/index';

type Configs = { [id: string]: InteractionConfig };

class InteractionUtils {
  protected constructor() {}

  static BaseClass: typeof InteractionObject;
  static configs: Configs;

  static findConfig(
    id: string
  ): InteractionConfig {
    return this.configs[id];
  }

  static findSpecialClass(
    specialId: string
  ): typeof InteractionObject {
    return this.BaseClass.customs[specialId];
  }

  static create(
    parameters: InteractionParameters,
    id: string | number
  ): InteractionObject {
    const config = this.findConfig(id as string);
    if (!config) {
      console.error('Can not find config', parameters, config);
      return null;
    }
    let ObjectClass = this.BaseClass;
    if (config.specialClass) {
      ObjectClass = this.findSpecialClass(config.specialClass);;
      if (!ObjectClass) {
        console.error('Can not find special class.', config, parameters);
        return null;
      }
    }
    const _object = new ObjectClass();    
    _object.initialize(config, parameters);
    return _object;
  }
}

export {
  InteractionUtils
}
