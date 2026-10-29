export class InputManager {
  constructor() {
    this.keys = new Set();
    this.pointer = { x: 0, y: 0, down: false };
    this.listeners = {};

    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      this.emit('keyDown', event);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
      this.emit('keyUp', event);
    });

    window.addEventListener('pointermove', (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.emit('pointerMove', event);
    });

    window.addEventListener('pointerdown', (event) => {
      this.pointer.down = true;
      this.emit('pointerDown', event);
    });

    window.addEventListener('pointerup', (event) => {
      this.pointer.down = false;
      this.emit('pointerUp', event);
    });
  }

  isPressed(key) {
    return this.keys.has(String(key).toLowerCase());
  }

  on(eventName, handler) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(handler);
  }

  emit(eventName, event) {
    for (const handler of this.listeners[eventName] || []) {
      handler(event);
    }
  }
}
