export class AssetManager {
  constructor() {
    this.assets = new Map();
  }

  register(name, asset) {
    this.assets.set(name, asset);
    return asset;
  }

  get(name) {
    return this.assets.get(name);
  }

  preload(list) {
    for (const name of list) {
      if (!this.assets.has(name)) {
        console.warn(`[AssetManager] Missing asset: ${name}`);
      }
    }
  }
}
