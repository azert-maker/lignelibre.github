import { Engine } from '../core/Engine.js';
import { GameState } from '../core/GameState.js';
import { InputManager } from '../core/InputManager.js';
import { SceneManager } from '../core/SceneManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { ReplaySystem } from '../systems/ReplaySystem.js';
import { BmxSport } from '../game/sports/bmx/BmxSport.js';
import { HUD } from '../ui/HUD.js';
import { Onboarding } from '../ui/Onboarding.js';

export function createGameApp(rootElement) {
  const scene = new SceneManager();
  const state = new GameState();
  const input = new InputManager();
  const saveSystem = new SaveSystem();
  const progression = new ProgressionSystem({ saveSystem });
  const replaySystem = new ReplaySystem();
  const sport = new BmxSport();
  const hud = new HUD(rootElement);
  const onboarding = new Onboarding(rootElement);

  hud.mount();
  onboarding.show();

  const engine = new Engine({
    scene,
    renderer: { render: () => { }, camera: null },
    input,
    state,
  });

  engine.registerSystem('sport', sport);
  engine.registerSystem('progression', progression);
  engine.registerSystem('replay', replaySystem);

  return {
    engine,
    state,
    hud,
    sport,
    progression,
    replaySystem,
  };
}
