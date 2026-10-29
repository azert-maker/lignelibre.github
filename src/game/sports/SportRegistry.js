export class SportRegistry {
  constructor() {
    this.sports = new Map();
  }

  register(name, sport) {
    this.sports.set(name, sport);
    return this;
  }

  get(name) {
    return this.sports.get(name);
  }

  list() {
    return Array.from(this.sports.keys());
  }
}
