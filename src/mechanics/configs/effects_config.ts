import type { EffectConfig } from '../effects/index';

type EffectsConfig = { [id: string]: EffectConfig };

const effectsConfig: EffectsConfig = {
  0: {
    name: 'Inherent stamina regeneration',
    innerGradualInfluence: {
      stamina: 5
    }
  }
}

export {
  EffectsConfig,
  effectsConfig
}
