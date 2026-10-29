export class Onboarding {
  constructor(rootElement) {
    this.root = rootElement;
  }

  show() {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="ll-onboarding">
        <h2>Roule, saute, atterris.</h2>
        <p>Ramasse les pièces, garde le combo, et répète.</p>
      </div>
    `;
  }
}
