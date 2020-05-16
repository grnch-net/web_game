import { Shot } from '../skills/customs/shot';

(Shot as any).Modify((Latest: typeof Shot) => {
  return class extends Latest {
    on_apply(
      ...args: any
    ) {
      super.on_apply(args[0], args[1]);
      console.info('Shot', args[1].influenced);
    }
  }
});
