console.info('modifications/log/character');

import {
  Character
} from '../../character';

type Mod = Modifiable<typeof Character>;

class CharacterLog extends (Character as Mod).Latest {

  use_skill(
    ...args: any
  ): boolean {
    console.info(this.name, 'Use skill', args[0].name);
    return super.use_skill(args[0]);
  }

}

(Character as Mod).modify(CharacterLog);
