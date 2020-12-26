import { Shot } from '../skills/customs/shot';
type Mod = Modifiable<typeof Shot>;

class ShotLog extends (Shot as Mod).Latest {

  on_apply(
    ...args: any
  ) {
    super.on_apply(args[0], args[1]);
    console.info('Shot', args[1].influenced);
  }

}

(Shot as Mod).modify(ShotLog);
