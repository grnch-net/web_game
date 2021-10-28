import type {
  EffectConfig
} from '../effects/index';

type EffectsConfig = Associative<EffectConfig>;

enum EffectName {
  InherentStaminaRegen,
  Lucky
}

const effectsConfig: EffectsConfig = {
  [EffectName.InherentStaminaRegen]: {
    name: 'Inherent stamina regeneration',
    innerGradualInfluence: {
      stamina: 5
    }
  },
  [EffectName.Lucky]: {
    name: 'Lucky'
  }
}

export {
  EffectsConfig,
  EffectName,
  effectsConfig
}
