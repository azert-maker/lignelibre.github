export class Engine {
  constructor({ scene, renderer, input, state }) {
    this.scene = scene;
    this.renderer = renderer;
    this.input = input;
    this.state = state;
    this.running = false;
    this.lastFrame = 0;
    this.systems = new Map();
  }

  registerSystem(name, system) {
    this.systems.set(name, system);
    return this;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame((time) => this.tick(time));
  }

  stop() {
    this.running = false;
  }

  tick(time) {
    if (!this.running) return;

    const dt = Math.min((time - this.lastFrame) / 1000, 0.05);
    this.lastFrame = time;

    for (const system of this.systems.values()) {
      if (typeof system.update === 'function') {
        system.update(dt, this.state);
      }
    }

    this.renderer.render(this.scene, this.renderer.camera || this.scene.camera);
    requestAnimationFrame((next) => this.tick(next));
  }
}
