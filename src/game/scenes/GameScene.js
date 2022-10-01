import { Scene } from 'phaser';

// Utils
import {
    handleCreateMap,
    handleCreateHero,
    handleObjectsLayer,
    handleHeroMovement,
    handleCreateGroups,
    handleCreateControls,
    handleConfigureCamera,
    handleConfigureGridEngine,
    handleCreateHeroAnimations,
    handleCreateCharactersMovements,
} from '../../utils/sceneHelpers';

// Utils
import { getDispatch } from '../../utils/utils';

// Actions
import setGameCameraSizeUpdateCallbackAction from '../../redux/actions/game/setGameCameraSizeUpdateCallbackAction';

export default class GameScene extends Scene {
  hud = {};
  resourceState = {
      electric: 98.21,
      oxygen: 99.1,
      food: 99.02,
      fuel: 83.02,
  };

  constructor() {
      super('GameScene');
  }

  create() {
      const dispatch = getDispatch();

      // All of these functions need to be called in order

      // Create controls
      handleCreateControls(this);

      // Create game groups
      handleCreateGroups(this);

      // Create the map
      handleCreateMap(this);

      // Create hero sprite
      handleCreateHero(this);

      // Configure grid engine
      handleConfigureGridEngine(this);

      // Load game objects like items, enemies, etc
      handleObjectsLayer(this);

      // Configure the main camera
      handleConfigureCamera(this);
      dispatch(
          setGameCameraSizeUpdateCallbackAction(() => {
              handleConfigureCamera(this);
          })
      );

      // Hero animations
      handleCreateHeroAnimations(this);

      // Handle characters movements
      handleCreateCharactersMovements(this);

      this.hud.text = this.add.text(0, 0, this.getHudText(), {
          font: '"Press Start 2P"',
      });
      this.hud.text.setDepth(10);
  }

  getHudText() {
      const { electric, oxygen, food, fuel } = this.resourceState;
      return `Electricity: ${electric}%\nOxygen: ${oxygen}%\nFood: ${food}%\nFuel: ${fuel}%`;
  }

  update(time, delta) {
      handleHeroMovement(this);
      this.heroSprite.update(time, delta);

      this.resourceState.fuel -= 0.0000001 * delta;
      this.hud.text.setText(this.getHudText());
  }
}
