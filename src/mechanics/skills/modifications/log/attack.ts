console.info('skills/modifications/log/attack');

import {
  Attack
} from '../../customs/attack';

type Mod = Modifiable<typeof Attack>;

class AttackLog extends (Attack as Mod).Latest {

  on_apply(
    ...args: any
  ) {
    super.on_apply(args[0], args[1]);
    console.info('Attack', args[1].influenced);
  }

}

(Attack as Mod).modify(AttackLog);
