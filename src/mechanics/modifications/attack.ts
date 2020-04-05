import { Attack } from '../skills/customs/attack';

(Attack as any).Modify((Latest: typeof Attack) => {
  return class extends Latest {
    on_cast_complete(
      ...args: any
    ) {
      super.on_cast_complete(args[0], args[1]);
      console.info('Attack', args[1].negative);
    }
  }
});
