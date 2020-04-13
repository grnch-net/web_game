import { Attack } from '../skills/customs/attack';

(Attack as any).Modify((Latest: typeof Attack) => {
  return class extends Latest {
    on_apply(
      ...args: any
    ) {
      super.on_apply(args[0], args[1]);
      console.info('Attack', args[1].influenced);
    }
  }
});
