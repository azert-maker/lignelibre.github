export class ReplaySystem {
  constructor() {
    this.frames = [];
  }

  recordFrame(frame) {
    this.frames.push(frame);
  }

  clear() {
    this.frames.length = 0;
  }

  export() {
    return this.frames.slice();
  }
}
