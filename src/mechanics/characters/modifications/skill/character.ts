import {
  Impact,
  InteractResult
} from '../../../interactions/index';

import {
  Skill,
  SkillParameters,
  SkillsController,
} from '../../../skills/index';

import {
  CharacterConfig,
  CharacterParameters,
  Character
} from '../../character';

type Mod = Modifiable<typeof Character>;

class CharacterSkill extends (Character as Mod).Latest {

  initialize(
    parameters: CharacterParameters,
    config: CharacterConfig
  ) {
    super.initialize(parameters, config);
    this.initialize_skills(this.parameters.skills, this.config.skills);
  }

  protected initialize_skills(
    parameters: SkillParameters[],
    config: SkillParameters[]
  ) {
    this.skills = new SkillsController;
    const list = [...config, ...parameters];
    this.skills.initialize(list);
  }

  protected add_outer_skill(
    skill: Skill
  ) {
    super.add_outer_skill(skill);
    this.skills.addToRecovery(skill);
  }

  protected tick_listeners(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    super.tick_listeners(dt, innerImpact, outerImpact);
    this.tick_skills(dt, innerImpact, outerImpact);
  }

  protected tick_skills(
    dt: number,
    innerImpact: Impact,
    outerImpact: Impact
  ) {
    this.skills.tick(dt, innerImpact, outerImpact);
    const skill = this.skills.using;
    // TODO: add delta time
    // if (skill && !skill.castTime) {
    //   const costImpact = skill.getGradualCostImpact();
    //   if (costImpact) {
    //     const paid = this.apply_cost(costImpact);
    //     if (!paid) this.skills.cancelUse();
    //   }
    // }
  }

  protected interact_listeners(
    innerImpact: Impact,
    interactResult: InteractResult
  ) {
    super.interact_listeners(innerImpact, interactResult);
    this.skills.onOuterImpact(innerImpact, interactResult);
  }

  protected check_skill(
    skill: Skill
  ): boolean {
    const result = super.check_skill(skill);
    return result && this.skills.readyToUse(skill);
  }

  protected get_skill(
    id: string | number
  ): Skill {
    super.get_skill(id);
    return this.skills.getToUse(id as string);
  }

  protected use_skill(
    skill: Skill
  ): boolean {
    super.use_skill(skill);
    const checked_needs = this.check_skill_needs(skill);
    if (!checked_needs) {
      return false;
    }
    const checked_stock = this.check_skill_stock(skill);
    if (!checked_stock) {
      return false;
    }
    const paid_cost = this.pay_skill_cost(skill);
    if (!paid_cost) {
      return false;
    }
    const innerImpact = new Impact;
    const outerImpact = new Impact;
    this.skills.use(skill, innerImpact, outerImpact);
    this.skill_listeners(innerImpact, outerImpact);
    this.apply_impact(innerImpact);
    this.apply_interaction(outerImpact);
    return true;
  }

  protected check_skill_needs(
    skill: Skill
  ) {
    const needs = skill.needs;
    if (needs) {
      const needs_result = this.get_skill_needs(needs);
      const checked = skill.checkNeeds(needs_result);
      if (!checked) {
        return false;
      }
    }
    return true;
  }

  protected check_skill_stock(
    skill: Skill
  ) {
    const stockImpact = skill.getStockImpact();
    if (stockImpact) {
      const stocked = this.check_impact(stockImpact);
      if (!stocked) {
        return false;
      }
    }
    return true;
  }

  protected pay_skill_cost(
    skill: Skill
  ) {
    const costImpact = skill.getCostImpact();
    if (costImpact) {
      const paid = this.apply_cost(costImpact);
      if (!paid) {
        return false;
      }
    }
    return true;
  }

  protected interact_result_listeners(
    result: InteractResult
  ) {
    super.interact_result_listeners(result);
    this.skills.interactResult(result);
  }

}

(Character as Mod).modify(CharacterSkill);
