console.info('skills/modifications/log/skill');

import {
  Skill
} from '../../skill';

type Mod = Modifiable<typeof Skill>;

class SkillLog extends (Skill as Mod).Latest {

  use(
    ...args: any
  ) {
    console.info('Use skill', this.name);
    super.use(args[0], args[1]);
  }

}

(Skill as Mod).modify(SkillLog);
