import {
  InteractionObject, InteractionConfig, InteractionParameters
} from '../interactions/index';

export interface InventoryObjectConfig extends InteractionConfig {
  name: string;
  usageTime?: number;
}

export interface InventoryObjectParameters extends InteractionParameters {
  name?: string;
}

export class InventoryObject extends InteractionObject {
  protected config: InventoryObjectConfig;
  protected parameters: InventoryObjectParameters;

  get name(): string {
    return this.config.name;
  }

  get customName(): string {
    return this.parameters.name;
  }
}
