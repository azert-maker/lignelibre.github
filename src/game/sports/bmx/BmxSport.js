export class BmxSport {
  constructor() {
    this.name = 'bmx';
    this.state = {
      trick: 'manual',
      combo: 0,
      isAirborne: false,
    };
  }

  update(dt, gameState) {
    gameState.player.speed = gameState.player.speed || 0;
    gameState.player.combo = this.state.combo;
    return this;
  }

  handleInput(input) {
    if (input.isPressed('arrowup')) {
      this.state.isAirborne = true;
    }
  }
}
