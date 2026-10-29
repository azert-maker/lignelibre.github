export class LocationRegistry {
  constructor() {
    this.locations = new Map();
  }

  register(name, location) {
    this.locations.set(name, location);
    return this;
  }

  get(name) {
    return this.locations.get(name);
  }
}
