import { Character } from '../character';

(Character as any).Modify((Latest: typeof Character) => {
  return class extends Latest {
    use_skill(
      ...args: any
    ): boolean {
      console.info(this.name, 'Use skill', args[0].name);
      return super.use_skill(args[0]);
    }
  }
});
