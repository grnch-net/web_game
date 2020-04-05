import type { EffectConfig } from '../effects/index';

type EffectsConfig = { [id: string]: EffectConfig };

const effectsConfig: EffectsConfig = {
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

export {
  EffectsConfig,
  effectsConfig
}
