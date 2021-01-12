import type {
  EffectConfig
} from '../effects/index';

type EffectsConfig = Associative<EffectConfig>;

enum EffectName {
  InhStaminaRegen,
}

const effectsConfig: EffectsConfig = {
  [EffectName.InhStaminaRegen]: {
    name: 'Inherent stamina regeneration',
    innerGradualInfluence: {
      stamina: 5
    }
  }
}

export {
  EffectsConfig,
  EffectName,
  effectsConfig
}
