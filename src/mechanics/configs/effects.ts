import { EffectConfig } from '../effects/index';

type EffectsConfig = { [id: string]: EffectConfig };
export const effectsConfig: EffectsConfig = {
  0: {
    name: 'Inherent stamina regeneration',
    innerGradualInfluences: [
      {
        attribute: 'stamina',
        value: 5
      }
    ]
  }
}
