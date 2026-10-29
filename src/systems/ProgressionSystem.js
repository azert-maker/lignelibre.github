export class ProgressionSystem {
  constructor({ saveSystem }) {
    this.saveSystem = saveSystem;
  }

  applyReward({ coins = 0, score = 0 }) {
    const profile = this.saveSystem.readProfile();
    profile.coins += coins;
    profile.totalScore += score;
    this.saveSystem.writeProfile(profile);
    return profile;
  }

  updateProgress(state) {
    state.player.coins = state.player.coins || 0;
    state.player.score = state.player.score || 0;
    return state;
  }
}
