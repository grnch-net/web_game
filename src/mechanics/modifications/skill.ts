import { Skill } from '../skills/skill';

(Skill as any).Modify((Latest: typeof Skill) => {
  return class extends Latest {
    use(
      ...args: any
    ) {
      console.info('Use skill', this.name);
      super.use(args[0], args[1]);
    }
  }
});
