class Attribute {
  constructor(
    public val: number = 100,
    public max: number = 100,
    public min: number = 0
  ) {}
}

enum eEffects {
  weariness
}

class Effects {
  list: any = {};
  protected tick_handlers: any[] = [];

  add(name: eEffects, effect: any) {
    effect.onTick && this.tick_handlers.push(effect.onTick);
    this.list[name] = effect;
  }

  remove(name: eEffects) {
    const effect = this.list[name];
    delete this.list[name];
    if (effect.onTick) {
      const index = this.tick_handlers.indexOf(effect.onTick);
      this.tick_handlers.splice(index, 1);
    }
    effect.onRemove && effect.onRemove();
  }

  tick(dt: number = 0) {
    this.tick_handlers.forEach(handler => handler(dt));
  }
}

export default class Character {
  health: Attribute;
  stamina: Attribute;
  // weariness: Attribute;
  effects: Effects;
  statistic: any;

  constructor() {
    this.initialize();
  }

  initialize() {
    this.health = new Attribute();
    this.stamina = new Attribute();
    this.effects = new Effects();
  }

  updateStatistic() {

  }
}
