export const bootstrap = () => {
  const root = document.getElementById('game-root');
  const state = {
    player: { score: 0, coins: 0, combo: 0 },
  };

  return {
    state,
    root,
  };
};
