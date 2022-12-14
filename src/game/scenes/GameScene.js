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
import GameState from '../../utils/gameState';

export default class GameScene extends Scene {
  gameState = null;
  end = false;

  constructor() {
      super('GameScene');
  }

  preload() {}

  create() {
      const music = this.sound.add('theme');
      music.play();

      this.problemSound = this.sound.add('problem');

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

      this.background = this.sys.add.image(0, 0, 'bg').setDepth(-5);
      this.background.displayWidth = window.innerWidth + 200;
      this.background.displayHeight = window.innerHeight + 200;
      this.gameState = new GameState(this);

      this.events.on('showDialog', (text, end) => {
          if (end === true) this.end = true;
          this.gameState.pause();
      }, this);

      this.events.on('hideDialog', (text, pause) => {
          if (this.end === false) {
              this.gameState.unpause();
          }
      }, this);
  }

  update(time, delta) {
      handleHeroMovement(this);
      this.heroSprite.update(time, delta);

      this.gameState.update(this, time, delta);
  }
}
