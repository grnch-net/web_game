import {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  EffectsController,
  EffectParameters
} from '../../../effects/index';

import {
  CharacterConfig,
  CharacterParameters,
  Character
} from '../../character';

type Mod = Modifiable<typeof Character>;

class CharacterEffect extends (Character as Mod).Latest {

  initialize(
    parameters: CharacterParameters,
    config: CharacterConfig
  ) {
    super.initialize(parameters, config);
    this.initialize_effects(this.parameters.effects, this.config.effects);
  }

  protected initialize_effects(
    parameters: EffectParameters[],
    config: EffectParameters[]
  ) {
    this.effects = new EffectsController;
    const impact = new Impact;
    const list = [...config, ...parameters];
    this.effects.initialize(list, impact);
    this.apply_impact(impact);
  }

  protected tick_listeners(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.tick_listeners(dt, innerImpact, outerImpact);
    this.effects.tick(dt, innerImpact, outerImpact);
  }

  protected apply_impact(
    innerImpact: Impact
  ) {
    super.apply_impact(innerImpact);
    // for (const effect of innerImpact.effects) {
    //   this.effects.add(effect, innerImpact);
    // }
  }

  protected interact_listeners(
    innerImpact: Impact,
    interactResult: InteractResult
  ) {
    super.interact_listeners(innerImpact, interactResult);
    this.effects.onOuterImpact(innerImpact, interactResult);
  }

  protected skill_listeners(
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.skill_listeners(innerImpact, outerImpact);
    this.effects.onUseSkill(innerImpact, outerImpact);
  }

}

(Character as Mod).modify(CharacterEffect);
