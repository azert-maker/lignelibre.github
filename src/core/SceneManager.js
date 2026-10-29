export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.root = null;
  }

  setScene(scene) {
    this.scene = scene;
    return this;
  }

  setCamera(camera) {
    this.camera = camera;
    return this;
  }

  setRoot(root) {
    this.root = root;
    return this;
  }
}
