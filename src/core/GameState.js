export class GameState {
  constructor(initialState = {}) {
    this.data = {
      time: 0,
      running: true,
      activeSport: null,
      activeLocation: null,
      player: {
        score: 0,
        coins: 0,
        combo: 0,
        speed: 0,
      },
      ...initialState,
    };
  }

  set(path, value) {
    const keys = path.split('.');
    let ref = this.data;

    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (!ref[key] || typeof ref[key] !== 'object') {
        ref[key] = {};
      }
      ref = ref[key];
    }

    ref[keys[keys.length - 1]] = value;
    return this;
  }

  get(path) {
    return path.split('.').reduce((acc, key) => acc?.[key], this.data);
  }

  update(dt) {
    this.data.time += dt;
  }
}
