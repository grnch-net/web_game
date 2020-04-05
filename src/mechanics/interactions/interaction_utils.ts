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
    config?: InteractionConfig
  ): InteractionObject {
    config = config || this.findConfig(parameters.id as string);
    if (!config) {
      console.error('Can not find equip config with id:', parameters.id);
      return null;
    }
    let BaseClass = this.BaseClass;
    if (config.specialClass) {
      BaseClass = this.findSpecialClass(config.specialClass);;
      if (!BaseClass) {
        console.error('Can not find special class.', config, parameters);
        return null;
      }
    }
    const _object = new BaseClass();
    _object.initialize(config, parameters);
    return _object;
  }
}

export {
  InteractionUtils
}
