export class HUD {
  constructor(rootElement) {
    this.root = rootElement;
    this.elements = {};
  }

  mount() {
    this.root.innerHTML = `
      <div class="ll-hud">
        <div class="ll-hud__score">Score: <span data-role="score">0</span></div>
        <div class="ll-hud__coins">Coins: <span data-role="coins">0</span></div>
        <div class="ll-hud__combo">Combo: <span data-role="combo">0</span></div>
      </div>
    `;

    this.elements.score = this.root.querySelector('[data-role="score"]');
    this.elements.coins = this.root.querySelector('[data-role="coins"]');
    this.elements.combo = this.root.querySelector('[data-role="combo"]');
  }

  render(state) {
    if (!this.root) return;
    this.elements.score.textContent = state.player.score || 0;
    this.elements.coins.textContent = state.player.coins || 0;
    this.elements.combo.textContent = state.player.combo || 0;
  }
}
